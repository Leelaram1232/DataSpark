"""
DataSpark Backend — Projects Router
CRUD endpoints for projects and file trees.
"""
import uuid

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    FileCreateRequest,
    FileResponse,
    FileTree,
    MessageResponse,
)
from app.services import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a new project."""
    service = ProjectService(db)
    return await service.create_project(data, current_user.id)


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    db: DbSession,
    current_user: CurrentUser,
    workspace_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """List all projects for the authenticated user."""
    service = ProjectService(db)
    return await service.list_projects(
        current_user.id,
        workspace_type=workspace_type,
        page=page,
        page_size=page_size,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """Get a specific project by ID."""
    service = ProjectService(db)
    return await service.get_project(project_id, current_user.id)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update a project's metadata."""
    service = ProjectService(db)
    return await service.update_project(project_id, data, current_user.id)


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """Permanently delete a project and all its files."""
    service = ProjectService(db)
    await service.delete_project(project_id, current_user.id)
    return MessageResponse(message="Project deleted successfully")


# ── File Tree ──────────────────────────────────────────────────────────────────
@router.get("/{project_id}/files", response_model=list[FileTree])
async def get_file_tree(
    project_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """Get the full file tree for a project."""
    service = ProjectService(db)
    return await service.get_file_tree(project_id, current_user.id)


@router.post("/{project_id}/files", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def create_file(
    project_id: uuid.UUID,
    data: FileCreateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a file or directory entry in a project."""
    service = ProjectService(db)
    return await service.create_file(project_id, data, current_user.id)
