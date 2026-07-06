"""
DataSpark Backend — Project Service
Business logic for project management.
"""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models import Project, ProjectFile
from app.repositories import ProjectRepository, FileRepository
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    FileCreateRequest,
    FileResponse,
    FileTree,
)


class ProjectService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_repo = ProjectRepository(session)
        self.file_repo = FileRepository(session)

    async def create_project(
        self, data: ProjectCreate, owner_id: uuid.UUID
    ) -> ProjectResponse:
        project = await self.project_repo.create({
            "name": data.name,
            "description": data.description,
            "workspace_type": data.workspace_type,
            "owner_id": owner_id,
            "organization_id": data.organization_id,
            "is_public": data.is_public,
            "settings": data.settings,
        })

        # Auto-create the 11 standard directories for every project workspace
        folders = [
            "Maps", "Type Trees", "Specifications", "Test Data",
            "Documentation", "AI Conversations", "Knowledge", "Training",
            "Deployments", "Outputs", "Logs"
        ]
        for folder in folders:
            await self.file_repo.create({
                "project_id": project.id,
                "name": folder,
                "path": folder,
                "is_directory": True,
                "parent_path": None,
            })

        return ProjectResponse.model_validate(project)

    async def list_projects(
        self,
        owner_id: uuid.UUID,
        *,
        workspace_type: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ProjectListResponse:
        skip = (page - 1) * page_size
        projects, total = await self.project_repo.get_by_owner(
            owner_id,
            workspace_type=workspace_type,
            skip=skip,
            limit=page_size,
        )
        return ProjectListResponse(
            items=[ProjectResponse.model_validate(p) for p in projects],
            total=total,
            page=page,
            page_size=page_size,
            has_more=(skip + len(projects)) < total,
        )

    async def get_project(
        self, project_id: uuid.UUID, user_id: uuid.UUID
    ) -> ProjectResponse:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundError("Project", str(project_id))
        await self._assert_access(project, user_id)
        return ProjectResponse.model_validate(project)

    async def update_project(
        self, project_id: uuid.UUID, data: ProjectUpdate, user_id: uuid.UUID
    ) -> ProjectResponse:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundError("Project", str(project_id))
        await self._assert_access(project, user_id)

        update_data = data.model_dump(exclude_none=True)
        updated = await self.project_repo.update(project_id, update_data)
        return ProjectResponse.model_validate(updated)

    async def delete_project(
        self, project_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundError("Project", str(project_id))
        await self._assert_access(project, user_id)
        await self.project_repo.delete(project_id)

    # ── File Management ────────────────────────────────────────────────────────

    async def create_file(
        self,
        project_id: uuid.UUID,
        data: FileCreateRequest,
        user_id: uuid.UUID,
    ) -> FileResponse:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundError("Project", str(project_id))
        await self._assert_access(project, user_id)

        file = await self.file_repo.create({
            "project_id": project_id,
            "name": data.name,
            "path": data.path,
            "is_directory": data.is_directory,
            "parent_path": data.parent_path,
        })
        return FileResponse.model_validate(file)

    async def get_file_tree(
        self, project_id: uuid.UUID, user_id: uuid.UUID
    ) -> list[FileTree]:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise NotFoundError("Project", str(project_id))
        await self._assert_access(project, user_id)

        files = await self.file_repo.get_by_project(project_id)
        return self._build_tree(files, parent_path=None)

    def _build_tree(
        self, files: list[ProjectFile], parent_path: str | None
    ) -> list[FileTree]:
        """Recursively build file tree from flat list."""
        nodes = []
        for f in files:
            if f.parent_path == parent_path:
                children = self._build_tree(files, f.path) if f.is_directory else []
                nodes.append(
                    FileTree(
                        id=f.id,
                        name=f.name,
                        path=f.path,
                        is_directory=f.is_directory,
                        children=children,
                    )
                )
        return nodes

    @staticmethod
    async def _assert_access(project: Project, user_id: uuid.UUID) -> None:
        if project.owner_id != user_id and not project.is_public:
            raise ForbiddenError("You do not have access to this project")
