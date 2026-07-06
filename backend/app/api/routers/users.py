"""
DataSpark Backend — Users Router
Profile management endpoints.
"""
import uuid

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession, CurrentSuperUser
from app.repositories import UserRepository
from app.schemas import UserResponse, UserUpdate, MessageResponse
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: CurrentUser):
    """Return the current user's profile."""
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update the current user's profile."""
    repo = UserRepository(db)
    updated = await repo.update(current_user.id, data.model_dump(exclude_none=True))
    return UserResponse.model_validate(updated)


@router.get("/{user_id}", response_model=UserResponse, dependencies=[])
async def get_user(user_id: uuid.UUID, db: DbSession, _: CurrentSuperUser):
    """Admin-only: Get any user by ID."""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise NotFoundError("User", str(user_id))
    return UserResponse.model_validate(user)


@router.delete("/me", response_model=MessageResponse)
async def delete_account(db: DbSession, current_user: CurrentUser):
    """Deactivate the current user's account."""
    repo = UserRepository(db)
    await repo.update(current_user.id, {"is_active": False})
    return MessageResponse(message="Account deactivated")
