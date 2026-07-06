"""
DataSpark Backend — Core Package Init
"""
from app.core.config import get_settings, Settings
from app.core.database import Base, get_db, get_supabase_client
from app.core.exceptions import (
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    ValidationError,
    StorageError,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

__all__ = [
    "get_settings",
    "Settings",
    "Base",
    "get_db",
    "get_supabase_client",
    "NotFoundError",
    "UnauthorizedError",
    "ForbiddenError",
    "ConflictError",
    "ValidationError",
    "StorageError",
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
]
