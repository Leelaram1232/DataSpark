"""
DataSpark Backend — Application Configuration
Uses pydantic-settings for type-safe env var loading.
"""
from functools import lru_cache
from typing import Any
from pydantic import field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ────────────────────────────────────────────────────────────────────
    app_name: str = "DataSpark"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "change-me-in-production"
    allowed_origins_str: str = Field("http://localhost:3000", validation_alias="allowed_origins")

    @property
    def allowed_origins(self) -> list[str]:
        v = self.allowed_origins_str
        if v.startswith("[") and v.endswith("]"):
            try:
                import json
                return json.loads(v)
            except Exception:
                pass
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    # ── JWT ────────────────────────────────────────────────────────────────────
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    # ── Supabase ───────────────────────────────────────────────────────────────
    supabase_url: str = "https://ffegvfycdtjukdulkfti.supabase.co"
    supabase_anon_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWd2ZnljZHRqdWtkdWxrZnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTgyOTUsImV4cCI6MjA5ODQ5NDI5NX0.DFtQo2t_5rzCsis4O7iIod_1R6WYaD8DxIUW5qO8h8Y"
    supabase_service_role_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWd2ZnljZHRqdWtkdWxrZnRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkxODI5NSwiZXhwIjoyMDk4NDk0Mjk1fQ.JjysBOmenZJ5VxQPovC9rrC5giBEojn-AQMYn3rsGzc"

    # ── Database ───────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/dataspark"

    # ── AI Services ────────────────────────────────────────────────────────────
    groq_api_key: str = Field("", validation_alias="groq_api_key")

    # ── Redis ──────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── Storage ────────────────────────────────────────────────────────────────
    storage_bucket: str = "dataspark-files"
    max_file_size_mb: int = 50

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
