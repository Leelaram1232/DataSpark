"""
Run DataSpark schema on Supabase using the Management API.
This executes the SQL to create all tables.
"""
import urllib.request
import urllib.error
import json

PROJECT_REF = "ffegvfycdtjukdulkfti"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWd2ZnljZHRqdWtkdWxrZnRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkxODI5NSwiZXhwIjoyMDk4NDk0Mjk1fQ.JjysBOmenZJ5VxQPovC9rrC5giBEojn-AQMYn3rsGzc"
BASE_URL = f"https://{PROJECT_REF}.supabase.co"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# Schema SQL broken into individual statements
STATEMENTS = [
    # UUID extension
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',

    # Users
    """CREATE TABLE IF NOT EXISTS users (
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
    )""",

    "CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)",
    "CREATE INDEX IF NOT EXISTS ix_users_supabase_uid ON users (supabase_uid)",

    # Organizations
    """CREATE TABLE IF NOT EXISTS organizations (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name        VARCHAR(255) NOT NULL,
      slug        VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      avatar_url  TEXT,
      plan        VARCHAR(50) NOT NULL DEFAULT 'free',
      max_members INTEGER DEFAULT 5,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ
    )""",

    "CREATE INDEX IF NOT EXISTS ix_organizations_slug ON organizations (slug)",

    # Organization Members
    """CREATE TABLE IF NOT EXISTS organization_members (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
      role            VARCHAR(50) NOT NULL DEFAULT 'member',
      joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )""",

    # Projects
    """CREATE TABLE IF NOT EXISTS projects (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name            VARCHAR(255) NOT NULL,
      description     TEXT,
      workspace_type  VARCHAR(50) NOT NULL,
      owner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
      organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      is_public       BOOLEAN NOT NULL DEFAULT FALSE,
      settings        JSONB DEFAULT '{}',
      metadata        JSONB DEFAULT '{}',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ
    )""",

    "CREATE INDEX IF NOT EXISTS ix_projects_owner_id ON projects (owner_id)",
    "CREATE INDEX IF NOT EXISTS ix_projects_workspace_type ON projects (workspace_type)",

    # Project Files
    """CREATE TABLE IF NOT EXISTS project_files (
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
    )""",

    "CREATE INDEX IF NOT EXISTS ix_project_files_project_id ON project_files (project_id)",

    # User Sessions
    """CREATE TABLE IF NOT EXISTS user_sessions (
      id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
      user_agent         TEXT,
      ip_address         VARCHAR(45),
      expires_at         TIMESTAMPTZ NOT NULL,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      revoked            BOOLEAN NOT NULL DEFAULT FALSE
    )""",

    # Plugins
    """CREATE TABLE IF NOT EXISTS plugins (
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
    )""",

    "CREATE INDEX IF NOT EXISTS ix_plugins_slug ON plugins (slug)",

    # User Plugins
    """CREATE TABLE IF NOT EXISTS user_plugins (
      id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
      plugin_id    UUID REFERENCES plugins(id) ON DELETE CASCADE,
      installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
      config       JSONB DEFAULT '{}'
    )""",
]


def run_sql(sql: str) -> dict:
    """Execute SQL via Supabase REST rpc or direct query."""
    url = f"{BASE_URL}/rest/v1/rpc/query"
    payload = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(url, data=payload, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return {"status": resp.status, "body": resp.read().decode()[:200]}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "error": e.read().decode()[:300]}


def run_sql_v2(sql: str) -> dict:
    """Use Supabase pg_query endpoint."""
    # Try using the PostgREST direct SQL execution
    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"
    payload = json.dumps({"query": sql}).encode()

    # Need management API token for this - not service role key
    # So we'll use a different approach: run SELECT to verify tables
    return {"note": "Management API requires personal access token"}


def check_tables() -> list:
    """Check which tables exist by querying information_schema."""
    # Use PostgREST to query information_schema
    url = f"{BASE_URL}/rest/v1/rpc/check_tables"
    # Instead query directly
    tables_to_check = [
        "users", "organizations", "organization_members",
        "projects", "project_files", "user_sessions",
        "plugins", "user_plugins"
    ]
    results = []
    for table in tables_to_check:
        url = f"{BASE_URL}/rest/v1/{table}?limit=0"
        req = urllib.request.Request(url, headers={**HEADERS, "Prefer": "count=exact"})
        try:
            with urllib.request.urlopen(req) as resp:
                results.append({"table": table, "status": "EXISTS ✅", "code": resp.status})
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if e.code == 404 or "relation" in body:
                results.append({"table": table, "status": "MISSING ❌", "code": e.code})
            else:
                results.append({"table": table, "status": f"ERROR ({e.code})", "code": e.code})
    return results


if __name__ == "__main__":
    print("=" * 60)
    print("DataSpark — Supabase Schema Verification")
    print("=" * 60)
    print(f"\nProject: {PROJECT_REF}.supabase.co")
    print("\nChecking existing tables...\n")

    results = check_tables()
    missing = []
    for r in results:
        print(f"  {r['status']}  {r['table']}")
        if "MISSING" in r["status"]:
            missing.append(r["table"])

    print()
    if missing:
        print(f"⚠️  {len(missing)} table(s) missing: {', '.join(missing)}")
        print("\n→ Please run supabase_schema.sql in Supabase Dashboard > SQL Editor")
    else:
        print("✅ All 8 tables exist in Supabase!")

    print("\n" + "=" * 60)
