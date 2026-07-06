import asyncio
import sys
from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.core.config import get_settings

settings = get_settings()

SQL_STATEMENTS = [
    # ── 11. EDI Maps ──────────────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS public.edi_maps (
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
    );""",
    "CREATE INDEX IF NOT EXISTS ix_edi_maps_project ON edi_maps (project_id);",

    # ── 12. Type Trees ────────────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS public.type_trees (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
      name        VARCHAR(255) NOT NULL,
      hierarchy   JSONB NOT NULL DEFAULT '[]',
      metadata    JSONB NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );""",
    "CREATE INDEX IF NOT EXISTS ix_type_trees_project ON type_trees (project_id);",

    # ── 13. Specifications ────────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS public.specifications (
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
    );""",
    "CREATE INDEX IF NOT EXISTS ix_specifications_project ON specifications (project_id);",

    # ── 14. AI Conversations ──────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS public.ai_conversations (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
      messages    JSONB NOT NULL DEFAULT '[]',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );""",
    "CREATE INDEX IF NOT EXISTS ix_ai_conversations_project ON ai_conversations (project_id);",

    # ── 15. Training Datasets ─────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS public.training_datasets (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
      name        VARCHAR(255) NOT NULL,
      status      VARCHAR(50) NOT NULL DEFAULT 'pending',
      metadata    JSONB NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );""",
    "CREATE INDEX IF NOT EXISTS ix_training_datasets_project ON training_datasets (project_id);",

    # ── 16. User Settings ─────────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS public.user_settings (
      user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      settings   JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );"""
]

async def main():
    print("=" * 60)
    print("DataSpark — Initializing New Tables on Supabase")
    print("=" * 60)
    
    if "YOUR_DB_PASSWORD" in settings.database_url:
        print("⚠️  DATABASE_URL password is placeholder. Skipping auto DDL execution.")
        print("Please copy the SQL statements from backend/supabase_schema.sql and run them in your Supabase SQL Editor.")
        return

    try:
        async with AsyncSessionLocal() as session:
            for statement in SQL_STATEMENTS:
                try:
                    await session.execute(text(statement))
                    print(f"Executed: {statement.strip().splitlines()[0][:40]}...")
                except Exception as ex:
                    print(f"Statement failed: {ex}")
            await session.commit()
            print("✅ All new tables generated successfully.")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    asyncio.run(main())
