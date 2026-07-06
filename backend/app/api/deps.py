"""
DataSpark Backend — Auth Dependency Injection
FastAPI dependencies for extracting and validating JWT-authenticated users.
"""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedError
from app.core.security import decode_token
from app.models import User
from app.repositories import UserRepository

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Extract and validate the JWT from the Authorization header.
    Returns the authenticated User model or raises 401.
    """
    if not credentials:
        raise UnauthorizedError("Missing Authorization header")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedError("Invalid or expired access token")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Invalid token payload")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Invalid token payload")

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)

    if not user or not user.is_active:
        raise UnauthorizedError("User not found or deactivated")

    return user


async def get_current_superuser(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Requires the current user to be a superuser."""
    if not current_user.is_superuser:
        raise UnauthorizedError("Superuser privileges required")
    return current_user


# ── Convenient type aliases ────────────────────────────────────────────────────
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentSuperUser = Annotated[User, Depends(get_current_superuser)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
