"""
DataSpark Backend — Base Repository
Generic async repository with CRUD operations.
"""
from __future__ import annotations

import uuid
from typing import Any, Generic, Type, TypeVar

from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic repository providing async CRUD operations.
    All domain repositories inherit from this class.
    """

    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, record_id: uuid.UUID) -> ModelType | None:
        result = await self.session.execute(
            select(self.model).where(self.model.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self, *, skip: int = 0, limit: int = 20
    ) -> list[ModelType]:
        result = await self.session.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count(self) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(self.model)
        )
        return result.scalar_one()

    async def create(self, data: dict[str, Any]) -> ModelType:
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(
        self, record_id: uuid.UUID, data: dict[str, Any]
    ) -> ModelType | None:
        await self.session.execute(
            update(self.model)
            .where(self.model.id == record_id)
            .values(**data)
        )
        return await self.get_by_id(record_id)

    async def delete(self, record_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(self.model).where(self.model.id == record_id)
        )
        return result.rowcount > 0

    async def exists(self, record_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            select(func.count()).select_from(self.model).where(
                self.model.id == record_id
            )
        )
        return result.scalar_one() > 0
