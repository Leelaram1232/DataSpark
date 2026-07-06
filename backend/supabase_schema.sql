-- =====================================================================
-- DataSpark — Complete Database Schema for Supabase
-- Run this entire script in: Supabase Dashboard > SQL Editor > New Query
-- =====================================================================

-- Enable UUID extension (needed for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Users ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            VARCHAR(255) UNIQUE NOT NULL,
  hashed_password  VARCHAR(255),
  full_name        VARCHAR(255),
  avatar_url       TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  is_superuser     BOOLEAN NOT NULL DEFAULT FALSE,
  supabase_uid     VARCHAR(255) UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ,
  last_login_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_users_email       ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_supabase_uid ON users (supabase_uid);

-- ── 2. Organizations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  avatar_url  TEXT,
  plan        VARCHAR(50) NOT NULL DEFAULT 'free',
  max_members INTEGER DEFAULT 5,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_organizations_slug ON organizations (slug);

-- ── 3. Organization Members ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(50) NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Projects ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  workspace_type  VARCHAR(50) NOT NULL CHECK (workspace_type IN ('developer','architecture','edi')),
  owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  settings        JSONB DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_projects_owner_id ON projects (owner_id);
CREATE INDEX IF NOT EXISTS ix_projects_workspace_type ON projects (workspace_type);

-- ── 5. Project Files ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_files (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  path         TEXT NOT NULL,
  storage_path TEXT,
  file_type    VARCHAR(100),
  size_bytes   BIGINT DEFAULT 0,
  is_directory BOOLEAN NOT NULL DEFAULT FALSE,
  parent_path  TEXT,
  content_hash VARCHAR(64),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_project_files_project_id ON project_files (project_id);
CREATE INDEX IF NOT EXISTS ix_project_files_path ON project_files (project_id, path);

-- ── 6. User Sessions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
  user_agent         TEXT,
  ip_address         VARCHAR(45),
  expires_at         TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked            BOOLEAN NOT NULL DEFAULT FALSE
);

-- ── 7. Plugins ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plugins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  description   TEXT,
  version       VARCHAR(50) NOT NULL,
  author        VARCHAR(255),
  category      VARCHAR(100),
  tags          JSONB DEFAULT '[]',
  install_count INTEGER DEFAULT 0,
  rating        INTEGER DEFAULT 0,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  manifest      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_plugins_slug ON plugins (slug);

-- ── 8. User Plugins ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_plugins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  plugin_id    UUID REFERENCES plugins(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  config       JSONB DEFAULT '{}'
);

-- ── 9. Storage Bucket ─────────────────────────────────────────────────
-- NOTE: Create the bucket manually in Supabase Dashboard > Storage > New Bucket
-- Name: dataspark-files
-- Public: false (use signed URLs)

-- ── 9b. ITX Documentation (imported from vector DB) ───────────────────
CREATE TABLE IF NOT EXISTS public.itx_documentation (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id   VARCHAR(255) UNIQUE NOT NULL,
  source     VARCHAR(255) NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_itx_documentation_chunk_id ON itx_documentation (chunk_id);

-- Enable RLS on ITX Documentation
ALTER TABLE itx_documentation ENABLE ROW LEVEL SECURITY;

-- Allow public read access to documentation chunks
-- Allow public read access to documentation chunks
DROP POLICY IF EXISTS "docs_public_read_access" ON itx_documentation;
CREATE POLICY "docs_public_read_access" ON itx_documentation
  FOR SELECT USING (TRUE);

-- ── 10. Row Level Security (RLS) — Optional but recommended ──────────
-- Users can only read/write their own data

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plugins ENABLE ROW LEVEL SECURITY;

-- Users: can only see their own row
DROP POLICY IF EXISTS "users_self_access" ON users;
CREATE POLICY "users_self_access" ON users
  FOR ALL USING (auth.uid()::text = supabase_uid);

-- Projects: owner access
DROP POLICY IF EXISTS "projects_owner_access" ON projects;
CREATE POLICY "projects_owner_access" ON projects
  FOR ALL USING (
    owner_id IN (
      SELECT id FROM users WHERE supabase_uid = auth.uid()::text
    )
    OR is_public = TRUE
  );

-- Project Files: via project ownership
DROP POLICY IF EXISTS "files_project_owner" ON project_files;
CREATE POLICY "files_project_owner" ON project_files
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN users u ON u.id = p.owner_id
      WHERE u.supabase_uid = auth.uid()::text
    )
  );

-- ── 11. EDI Maps ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.edi_maps (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  source_format  VARCHAR(50) NOT NULL,
  target_format  VARCHAR(50) NOT NULL,
  map_content    JSONB NOT NULL,
  status         VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  version        INTEGER DEFAULT 1,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_edi_maps_project ON edi_maps (project_id);

-- ── 12. Type Trees ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.type_trees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  hierarchy   JSONB NOT NULL DEFAULT '[]',
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_type_trees_project ON type_trees (project_id);

-- ── 13. Specifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.specifications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id         UUID REFERENCES projects(id) ON DELETE CASCADE,
  name               VARCHAR(255) NOT NULL,
  extracted_glossary JSONB NOT NULL DEFAULT '[]',
  business_rules     JSONB NOT NULL DEFAULT '[]',
  source_fields      JSONB NOT NULL DEFAULT '[]',
  target_fields      JSONB NOT NULL DEFAULT '[]',
  loops              JSONB NOT NULL DEFAULT '[]',
  conditions         JSONB NOT NULL DEFAULT '[]',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_specifications_project ON specifications (project_id);

-- ── 14. AI Conversations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  messages    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_ai_conversations_project ON ai_conversations (project_id);

-- ── 15. Training Datasets ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.training_datasets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  status      VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_training_datasets_project ON training_datasets (project_id);

-- ── 16. User Settings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  settings   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all new tables
ALTER TABLE edi_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE type_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Add bypass/owner policies (simplified tenant access)
DROP POLICY IF EXISTS "edi_maps_owner" ON edi_maps;
CREATE POLICY "edi_maps_owner" ON edi_maps FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "type_trees_owner" ON type_trees;
CREATE POLICY "type_trees_owner" ON type_trees FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "specifications_owner" ON specifications;
CREATE POLICY "specifications_owner" ON specifications FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "ai_conversations_owner" ON ai_conversations;
CREATE POLICY "ai_conversations_owner" ON ai_conversations FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "training_datasets_owner" ON training_datasets;
CREATE POLICY "training_datasets_owner" ON training_datasets FOR ALL USING (TRUE);

DROP POLICY IF EXISTS "user_settings_owner" ON user_settings;
CREATE POLICY "user_settings_owner" ON user_settings FOR ALL USING (TRUE);

-- ── Verify everything was created ────────────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ── 17. Storage Buckets Initialization ────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project_files', 'project_files', true),
  ('dataspark-files', 'dataspark-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies for 'project_files' and 'dataspark-files'
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('project_files', 'dataspark-files'));

DROP POLICY IF EXISTS "Allow public selection" ON storage.objects;
CREATE POLICY "Allow public selection" ON storage.objects FOR SELECT USING (bucket_id IN ('project_files', 'dataspark-files'));

DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id IN ('project_files', 'dataspark-files'));

DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id IN ('project_files', 'dataspark-files'));
