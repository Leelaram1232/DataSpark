"""
DataSpark Backend — Authentication Service
Business logic for registration, login, token refresh, and session management.
"""
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models import User, UserSession
from app.repositories import UserRepository
from app.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

settings = get_settings()


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register(self, data: RegisterRequest) -> tuple[User, TokenResponse]:
        """Register a new user and return tokens."""
        email = data.email.lower()

        if await self.user_repo.email_exists(email):
            raise ConflictError("Email already registered")

        user = await self.user_repo.create({
            "email": email,
            "hashed_password": hash_password(data.password),
            "full_name": data.full_name,
            "is_active": True,
            "is_verified": False,
        })

        tokens = await self._create_session(user)
        return user, tokens

    async def login(self, data: LoginRequest) -> tuple[User, TokenResponse]:
        """Authenticate user and return tokens."""
        email = data.email.lower()
        user = await self.user_repo.get_by_email(email)

        if not user or not user.hashed_password:
            raise UnauthorizedError("Invalid email or password")

        if not verify_password(data.password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedError("Account is deactivated")

        # Update last login
        await self.user_repo.update(user.id, {"last_login_at": datetime.now(timezone.utc)})

        tokens = await self._create_session(user)
        return user, tokens

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Exchange a valid refresh token for new token pair."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid refresh token")

        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedError("Invalid refresh token")

        user = await self.user_repo.get_by_id(uuid.UUID(user_id))
        if not user or not user.is_active:
            raise UnauthorizedError("User not found or deactivated")

        # Verify refresh token exists in sessions
        token_hash = self._hash_token(refresh_token)
        session = await self._get_session_by_token_hash(token_hash)
        if not session or session.revoked:
            raise UnauthorizedError("Refresh token has been revoked")

        # Revoke old session and create new one
        await self._revoke_session(session.id)
        return await self._create_session(user)

    async def logout(self, refresh_token: str) -> None:
        """Revoke a refresh token (logout)."""
        token_hash = self._hash_token(refresh_token)
        session = await self._get_session_by_token_hash(token_hash)
        if session:
            await self._revoke_session(session.id)

    async def _create_session(self, user: User) -> TokenResponse:
        """Create access + refresh tokens and persist session."""
        token_data = {"sub": str(user.id)}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        expire_at = datetime.now(timezone.utc) + timedelta(
            days=settings.refresh_token_expire_days
        )

        session = UserSession(
            user_id=user.id,
            refresh_token_hash=self._hash_token(refresh_token),
            expires_at=expire_at,
        )
        self.session.add(session)
        await self.session.flush()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60,
        )

    async def _get_session_by_token_hash(
        self, token_hash: str
    ) -> UserSession | None:
        from sqlalchemy import select
        result = await self.session.execute(
            select(UserSession).where(UserSession.refresh_token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def _revoke_session(self, session_id: uuid.UUID) -> None:
        from sqlalchemy import update
        await self.session.execute(
            update(UserSession)
            .where(UserSession.id == session_id)
            .values(revoked=True)
        )

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()
