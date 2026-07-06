"""
DataSpark — Initial Database Migration
Creates all core tables: users, organizations, projects, files, sessions, plugins.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Users ──────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.Text, nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("is_verified", sa.Boolean, default=False, nullable=False),
        sa.Column("is_superuser", sa.Boolean, default=False, nullable=False),
        sa.Column("supabase_uid", sa.String(255), unique=True, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_supabase_uid", "users", ["supabase_uid"])

    # ── Organizations ──────────────────────────────────────────────────────────
    op.create_table(
        "organizations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("avatar_url", sa.Text, nullable=True),
        sa.Column("plan", sa.String(50), default="free", nullable=False),
        sa.Column("max_members", sa.Integer, default=5),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_organizations_slug", "organizations", ["slug"])

    # ── Organization Members ───────────────────────────────────────────────────
    op.create_table(
        "organization_members",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="CASCADE")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("role", sa.String(50), default="member", nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Projects ───────────────────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("workspace_type", sa.String(50), nullable=False),
        sa.Column("owner_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("organization_id", UUID(as_uuid=True), sa.ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_public", sa.Boolean, default=False),
        sa.Column("settings", sa.JSON, default=dict),
        sa.Column("metadata", sa.JSON, default=dict),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # ── Project Files ──────────────────────────────────────────────────────────
    op.create_table(
        "project_files",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("path", sa.Text, nullable=False),
        sa.Column("storage_path", sa.Text, nullable=True),
        sa.Column("file_type", sa.String(100), nullable=True),
        sa.Column("size_bytes", sa.BigInteger, default=0),
        sa.Column("is_directory", sa.Boolean, default=False),
        sa.Column("parent_path", sa.Text, nullable=True),
        sa.Column("content_hash", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    # ── User Sessions ──────────────────────────────────────────────────────────
    op.create_table(
        "user_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("refresh_token_hash", sa.String(255), unique=True, nullable=False),
        sa.Column("user_agent", sa.Text, nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("revoked", sa.Boolean, default=False),
    )

    # ── Plugins ────────────────────────────────────────────────────────────────
    op.create_table(
        "plugins",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("version", sa.String(50), nullable=False),
        sa.Column("author", sa.String(255), nullable=True),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("tags", sa.JSON, default=list),
        sa.Column("install_count", sa.Integer, default=0),
        sa.Column("rating", sa.Integer, default=0),
        sa.Column("is_verified", sa.Boolean, default=False),
        sa.Column("manifest", sa.JSON, default=dict),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_plugins_slug", "plugins", ["slug"])

    # ── User Plugins ───────────────────────────────────────────────────────────
    op.create_table(
        "user_plugins",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("plugin_id", UUID(as_uuid=True), sa.ForeignKey("plugins.id", ondelete="CASCADE")),
        sa.Column("installed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("is_enabled", sa.Boolean, default=True),
        sa.Column("config", sa.JSON, default=dict),
    )


def downgrade() -> None:
    op.drop_table("user_plugins")
    op.drop_table("plugins")
    op.drop_table("user_sessions")
    op.drop_table("project_files")
    op.drop_table("projects")
    op.drop_table("organization_members")
    op.drop_table("organizations")
    op.drop_table("users")
