"""
DataSpark Backend — Project Repository
"""
from __future__ import annotations

import uuid

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Project, ProjectFile
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession):
        super().__init__(Project, session)

    async def get_by_owner(
        self,
        owner_id: uuid.UUID,
        *,
        workspace_type: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Project], int]:
        query = select(Project).where(Project.owner_id == owner_id)
        if workspace_type:
            query = query.where(Project.workspace_type == workspace_type)

        # Count total
        count_query = select(Project.id).where(Project.owner_id == owner_id)
        if workspace_type:
            count_query = count_query.where(Project.workspace_type == workspace_type)

        count_result = await self.session.execute(count_query)
        total = len(count_result.all())

        result = await self.session.execute(
            query.order_by(Project.updated_at.desc().nulls_last())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all()), total

    async def get_by_organization(
        self,
        org_id: uuid.UUID,
        *,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Project]:
        result = await self.session.execute(
            select(Project)
            .where(Project.organization_id == org_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_with_files(self, project_id: uuid.UUID) -> Project | None:
        result = await self.session.execute(
            select(Project)
            .options(selectinload(Project.files))
            .where(Project.id == project_id)
        )
        return result.scalar_one_or_none()


class FileRepository(BaseRepository[ProjectFile]):
    def __init__(self, session: AsyncSession):
        super().__init__(ProjectFile, session)

    async def get_by_project(
        self, project_id: uuid.UUID
    ) -> list[ProjectFile]:
        result = await self.session.execute(
            select(ProjectFile)
            .where(ProjectFile.project_id == project_id)
            .order_by(ProjectFile.is_directory.desc(), ProjectFile.name)
        )
        return list(result.scalars().all())

    async def get_by_path(
        self, project_id: uuid.UUID, path: str
    ) -> ProjectFile | None:
        result = await self.session.execute(
            select(ProjectFile).where(
                and_(
                    ProjectFile.project_id == project_id,
                    ProjectFile.path == path,
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_children(
        self, project_id: uuid.UUID, parent_path: str
    ) -> list[ProjectFile]:
        result = await self.session.execute(
            select(ProjectFile).where(
                and_(
                    ProjectFile.project_id == project_id,
                    ProjectFile.parent_path == parent_path,
                )
            ).order_by(ProjectFile.is_directory.desc(), ProjectFile.name)
        )
        return list(result.scalars().all())
