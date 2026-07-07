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

    token_str = credentials.credentials
    user_id = None

    # Step 1: Try local JWT decode
    payload = decode_token(token_str)
    if payload and payload.get("type") == "access":
        user_id_str = payload.get("sub")
        if user_id_str:
            try:
                user_id = uuid.UUID(user_id_str)
            except ValueError:
                pass

    # Step 2: Try verifying the token directly with Supabase Auth (no local JWT secret required)
    try:
        from app.core.database import get_supabase_client
        client = get_supabase_client()
        
        # This will verify the token with Supabase Auth REST API
        sb_user_res = client.auth.get_user(token_str)
        if sb_user_res and sb_user_res.user:
            sb_user = sb_user_res.user
            # Check if this user exists in public.users table by supabase_uid or email
            res = client.table("users").select("*").eq("supabase_uid", str(sb_user.id)).execute()
            if not res.data:
                res = client.table("users").select("*").eq("email", sb_user.email.lower()).execute()
                
            if res.data:
                user_data = res.data[0]
                return User(
                    id=uuid.UUID(user_data["id"]),
                    email=user_data["email"],
                    full_name=user_data.get("full_name"),
                    avatar_url=user_data.get("avatar_url"),
                    is_active=user_data.get("is_active", True),
                    is_superuser=user_data.get("is_superuser", False),
                    supabase_uid=user_data.get("supabase_uid"),
                )
            else:
                # Auto-create the user in our public.users table
                new_user_id = str(sb_user.id)
                new_user_payload = {
                    "id": new_user_id,
                    "email": sb_user.email.lower(),
                    "full_name": sb_user.user_metadata.get("full_name") if sb_user.user_metadata else "Supabase User",
                    "is_active": True,
                    "is_verified": True,
                    "is_superuser": False,
                    "supabase_uid": str(sb_user.id)
                }
                client.table("users").insert(new_user_payload).execute()
                return User(
                    id=uuid.UUID(new_user_id),
                    email=sb_user.email.lower(),
                    full_name=new_user_payload["full_name"],
                    is_active=True,
                    is_superuser=False,
                    supabase_uid=str(sb_user.id)
                )
    except Exception:
        pass

    # Step 3: Check local database / Supabase table using decoded user ID
    if user_id:
        try:
            repo = UserRepository(db)
            user = await repo.get_by_id(user_id)
            if user and user.is_active:
                return user
        except Exception:
            pass

        try:
            from app.core.database import get_supabase_client
            client = get_supabase_client()
            res = client.table("users").select("*").eq("id", str(user_id)).execute()
            if res.data:
                user_data = res.data[0]
                return User(
                    id=uuid.UUID(user_data["id"]),
                    email=user_data["email"],
                    full_name=user_data.get("full_name"),
                    avatar_url=user_data.get("avatar_url"),
                    is_active=user_data.get("is_active", True),
                    is_superuser=user_data.get("is_superuser", False),
                    supabase_uid=user_data.get("supabase_uid"),
                )
        except Exception:
            pass

    raise UnauthorizedError("Invalid or expired access token")


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
