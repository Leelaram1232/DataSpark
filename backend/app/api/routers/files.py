"""
DataSpark Backend — File Upload Router
Supabase Storage upload/download endpoints.
"""
import uuid

from fastapi import APIRouter, UploadFile, File, status
from fastapi.responses import JSONResponse

from app.api.deps import CurrentUser, DbSession
from app.core.database import get_supabase_client
from app.core.exceptions import NotFoundError, ForbiddenError
from app.repositories import ProjectRepository, FileRepository
from app.schemas import FileResponse, MessageResponse
from app.services import StorageService, ProjectService

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload/{project_id}", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    project_id: uuid.UUID,
    path: str,
    file: UploadFile = File(...),
    *,
    db: DbSession,
    current_user: CurrentUser,
):
    """
    Upload a file to a project's storage.
    `path` is the relative path within the project (e.g., 'src/main.py').
    """
    # Validate project access
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project", str(project_id))
    if project.owner_id != current_user.id:
        raise ForbiddenError()

    # Upload to Supabase Storage
    supabase = get_supabase_client()
    storage_service = StorageService(supabase)
    upload_result = await storage_service.upload_file(project_id, file, path)

    # Persist file metadata to DB
    import os
    file_repo = FileRepository(db)
    db_file = await file_repo.create({
        "project_id": project_id,
        "name": os.path.basename(path),
        "path": path,
        "parent_path": os.path.dirname(path) or None,
        "storage_path": upload_result["storage_path"],
        "file_type": upload_result["file_type"],
        "size_bytes": upload_result["size_bytes"],
        "is_directory": False,
    })

    return FileResponse.model_validate(db_file)


@router.get("/signed-url/{project_id}")
async def get_signed_url(
    project_id: uuid.UUID,
    path: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Get a temporary signed URL to download a project file."""
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(project_id)
    if not project:
        raise NotFoundError("Project", str(project_id))
    if project.owner_id != current_user.id and not project.is_public:
        raise ForbiddenError()

    storage_path = f"{project_id}/{path}"
    supabase = get_supabase_client()
    storage_service = StorageService(supabase)
    url = storage_service.get_signed_url(storage_path)
    return {"url": url, "expires_in": 3600}


@router.delete("/{file_id}", response_model=MessageResponse)
async def delete_file(
    file_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete a file from storage and remove its DB record."""
    file_repo = FileRepository(db)
    file = await file_repo.get_by_id(file_id)
    if not file:
        raise NotFoundError("File", str(file_id))

    # Validate ownership via project
    project_repo = ProjectRepository(db)
    project = await project_repo.get_by_id(file.project_id)
    if project and project.owner_id != current_user.id:
        raise ForbiddenError()

    # Delete from storage
    if file.storage_path:
        supabase = get_supabase_client()
        storage_service = StorageService(supabase)
        await storage_service.delete_file(file.storage_path)

    await file_repo.delete(file_id)
    return MessageResponse(message="File deleted successfully")
