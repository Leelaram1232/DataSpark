"""
DataSpark Backend — User Repository
"""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def get_by_supabase_uid(self, supabase_uid: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.supabase_uid == supabase_uid)
        )
        return result.scalar_one_or_none()

    async def get_active_users(self, *, skip: int = 0, limit: int = 20) -> list[User]:
        result = await self.session.execute(
            select(User)
            .where(User.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def email_exists(self, email: str) -> bool:
        result = await self.session.execute(
            select(User.id).where(User.email == email.lower())
        )
        return result.scalar_one_or_none() is not None
