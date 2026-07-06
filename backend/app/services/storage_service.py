"""
DataSpark Backend — Storage Service
Handles Supabase Storage file operations.
"""
from __future__ import annotations

import uuid
import mimetypes
from pathlib import Path

from fastapi import UploadFile
from supabase import Client

from app.core.config import get_settings
from app.core.exceptions import StorageError

settings = get_settings()


class StorageService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.bucket = settings.storage_bucket

    async def upload_file(
        self,
        project_id: uuid.UUID,
        file: UploadFile,
        path: str,
    ) -> dict:
        """Upload a file to Supabase Storage."""
        try:
            content = await file.read()

            if len(content) > settings.max_file_size_bytes:
                raise StorageError(
                    f"File exceeds maximum size of {settings.max_file_size_mb}MB"
                )

            storage_path = f"{project_id}/{path}"
            content_type = file.content_type or self._guess_content_type(path)

            response = self.supabase.storage.from_(self.bucket).upload(
                path=storage_path,
                file=content,
                file_options={"content-type": content_type, "upsert": "true"},
            )

            return {
                "storage_path": storage_path,
                "size_bytes": len(content),
                "file_type": content_type,
            }
        except StorageError:
            raise
        except Exception as e:
            raise StorageError(f"Upload failed: {str(e)}")

    def get_public_url(self, storage_path: str) -> str:
        """Get a public URL for a stored file."""
        return self.supabase.storage.from_(self.bucket).get_public_url(storage_path)

    def get_signed_url(self, storage_path: str, expires_in: int = 3600) -> str:
        """Get a signed (temporary) URL for a stored file."""
        response = self.supabase.storage.from_(self.bucket).create_signed_url(
            storage_path, expires_in
        )
        return response.get("signedURL", "")

    async def delete_file(self, storage_path: str) -> bool:
        """Delete a file from Supabase Storage."""
        try:
            self.supabase.storage.from_(self.bucket).remove([storage_path])
            return True
        except Exception:
            return False

    async def delete_folder(self, prefix: str) -> bool:
        """Delete all files in a folder prefix."""
        try:
            files = self.supabase.storage.from_(self.bucket).list(prefix)
            if files:
                paths = [f"{prefix}/{f['name']}" for f in files]
                self.supabase.storage.from_(self.bucket).remove(paths)
            return True
        except Exception:
            return False

    @staticmethod
    def _guess_content_type(filename: str) -> str:
        mime, _ = mimetypes.guess_type(filename)
        return mime or "application/octet-stream"
