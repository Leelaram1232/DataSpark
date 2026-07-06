"""
DataSpark Backend — Pydantic Schemas
Request/response models with full type safety.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ── Shared ─────────────────────────────────────────────────────────────────────
class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: datetime | None = None


# ── Auth Schemas ───────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = Field(None, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshRequest(BaseModel):
    refresh_token: str


# ── User Schemas ───────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: datetime | None = None


class UserMeResponse(UserResponse):
    """Extended user info for the /me endpoint."""
    is_superuser: bool


# ── Organization Schemas ───────────────────────────────────────────────────────
class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    description: str | None = None


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    plan: str
    created_at: datetime


class OrganizationMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user: UserResponse
    role: str
    joined_at: datetime


# ── Project Schemas ────────────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    workspace_type: Literal["developer", "architecture", "edi"]
    organization_id: uuid.UUID | None = None
    is_public: bool = False
    settings: dict[str, Any] = Field(default_factory=dict)


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_public: bool | None = None
    settings: dict[str, Any] | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None
    workspace_type: str
    owner_id: uuid.UUID | None = None
    organization_id: uuid.UUID | None = None
    is_public: bool
    created_at: datetime
    updated_at: datetime | None = None


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


# ── File Schemas ───────────────────────────────────────────────────────────────
class FileCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    path: str
    is_directory: bool = False
    parent_path: str | None = None


class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    path: str
    file_type: str | None = None
    size_bytes: int
    is_directory: bool
    parent_path: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class FileTree(BaseModel):
    """Recursive tree structure for the file explorer."""
    id: uuid.UUID
    name: str
    path: str
    is_directory: bool
    children: list[FileTree] = []


# ── Plugin Schemas ─────────────────────────────────────────────────────────────
class PluginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    version: str
    author: str | None = None
    category: str | None = None
    tags: list[str]
    install_count: int
    rating: int
    is_verified: bool


class PluginListResponse(BaseModel):
    items: list[PluginResponse]
    total: int


# ── Generic Response ───────────────────────────────────────────────────────────
class MessageResponse(BaseModel):
    message: str
    success: bool = True


class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
