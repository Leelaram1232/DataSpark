"""
DataSpark Backend — Authentication Router
Endpoints: /register, /login, /refresh, /logout, /me
"""
from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    RefreshRequest,
    UserMeResponse,
    UserUpdate,
    UserResponse,
    MessageResponse,
)
from app.services import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: DbSession):
    """Register a new user account and receive JWT tokens."""
    service = AuthService(db)
    user, tokens = await service.register(data)
    return tokens


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: DbSession):
    """Authenticate with email and password."""
    service = AuthService(db)
    user, tokens = await service.login(data)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(data: RefreshRequest, db: DbSession):
    """Exchange a refresh token for a new token pair (rotation)."""
    service = AuthService(db)
    return await service.refresh_tokens(data.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(data: RefreshRequest, db: DbSession):
    """Revoke a refresh token (logout from current device)."""
    service = AuthService(db)
    await service.logout(data.refresh_token)
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserMeResponse)
async def get_me(current_user: CurrentUser):
    """Get the currently authenticated user's profile."""
    return UserMeResponse.model_validate(current_user)
