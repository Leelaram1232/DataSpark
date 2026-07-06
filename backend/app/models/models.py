"""
DataSpark Backend — SQLAlchemy ORM Models
All database tables defined here using the declarative Base.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    BigInteger,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


# ── Users ──────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)  # nullable for OAuth
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    supabase_uid = Column(String(255), unique=True, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    organizations = relationship("OrganizationMember", back_populates="user")
    projects = relationship("Project", back_populates="owner")
    sessions = relationship("UserSession", back_populates="user")


# ── Organizations ──────────────────────────────────────────────────────────────
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    avatar_url = Column(Text, nullable=True)
    plan = Column(String(50), default="free", nullable=False)
    max_members = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    members = relationship("OrganizationMember", back_populates="organization")
    projects = relationship("Project", back_populates="organization")


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(String(50), default="member", nullable=False)  # owner, admin, member, viewer
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="organizations")


# ── Projects ───────────────────────────────────────────────────────────────────
class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    workspace_type = Column(
        String(50), nullable=False
    )  # developer, architecture, edi
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    is_public = Column(Boolean, default=False)
    settings = Column(JSON, default=dict)
    project_metadata = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="projects")
    organization = relationship("Organization", back_populates="projects")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")


# ── Project Files ──────────────────────────────────────────────────────────────
class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    path = Column(Text, nullable=False)  # relative path within project
    storage_path = Column(Text, nullable=True)  # Supabase Storage path
    file_type = Column(String(100), nullable=True)  # mime type
    size_bytes = Column(BigInteger, default=0)
    is_directory = Column(Boolean, default=False)
    parent_path = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="files")


# ── User Sessions ──────────────────────────────────────────────────────────────
class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    refresh_token_hash = Column(String(255), unique=True, nullable=False)
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="sessions")


# ── Plugins ────────────────────────────────────────────────────────────────────
class Plugin(Base):
    __tablename__ = "plugins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    version = Column(String(50), nullable=False)
    author = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    tags = Column(JSON, default=list)
    install_count = Column(Integer, default=0)
    rating = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    manifest = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UserPlugin(Base):
    __tablename__ = "user_plugins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    plugin_id = Column(UUID(as_uuid=True), ForeignKey("plugins.id", ondelete="CASCADE"))
    installed_at = Column(DateTime(timezone=True), server_default=func.now())
    is_enabled = Column(Boolean, default=True)
    config = Column(JSON, default=dict)
