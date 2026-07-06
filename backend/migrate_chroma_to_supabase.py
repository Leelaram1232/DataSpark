"""
DataSpark — Migrate Chroma Vector DB → Supabase PostgreSQL
Reads 2200 IBM Sterling ITX documentation chunks from the local
chroma.sqlite3 file and uploads them to the Supabase `itx_documentation` table
via the PostgREST API (service-role key).
"""
import os
import sys
import json
import sqlite3
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

# ── Configuration ──────────────────────────────────────────────────────────────
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "C:/Users/DELL/itx_vectordb/chroma.sqlite3")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ffegvfycdtjukdulkfti.supabase.co")
SERVICE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZWd2ZnljZHRqdWtkdWxrZnRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkxODI5NSwiZXhwIjoyMDk4NDk0Mjk1fQ.JjysBOmenZJ5VxQPovC9rrC5giBEojn-AQMYn3rsGzc",
)
BATCH_SIZE = 50


def read_chroma_chunks() -> list[dict]:
    """Extract document chunks + source metadata from chroma.sqlite3."""
    if not os.path.exists(CHROMA_DB_PATH):
        print(f"❌ Chroma DB not found at {CHROMA_DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(CHROMA_DB_PATH)
    cur = conn.cursor()

    # Build a mapping: embedding_id → {source, content}
    # embedding_metadata stores (id, key, string_value, …)
    cur.execute(
        "SELECT id, key, string_value FROM embedding_metadata WHERE key IN ('source', 'chroma:document')"
    )
    meta_rows = cur.fetchall()

    lookup: dict[int, dict] = {}
    for row_id, key, value in meta_rows:
        if row_id not in lookup:
            lookup[row_id] = {}
        if key == "source":
            lookup[row_id]["source"] = value
        elif key == "chroma:document":
            lookup[row_id]["content"] = value

    conn.close()

    chunks = []
    for emb_id, data in lookup.items():
        content = data.get("content", "")
        source = data.get("source", f"IBM_ITX_Page_{emb_id}")
        if content.strip():
            chunks.append({
                "chunk_id": f"itx_doc_{emb_id}",
                "source": source,
                "content": content,
            })

    return chunks


def upload_to_supabase(chunks: list[dict]):
    """POST chunks in batches to Supabase PostgREST."""
    url = f"{SUPABASE_URL}/rest/v1/itx_documentation"
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",  # upsert on chunk_id unique constraint
    }

    total = len(chunks)
    uploaded = 0
    errors = 0

    for i in range(0, total, BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        payload = json.dumps(batch).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                uploaded += len(batch)
                print(f"  [OK] Uploaded {uploaded}/{total} chunks (HTTP {resp.status})")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            errors += len(batch)
            print(f"  [FAIL] Batch {i}-{i+len(batch)} failed (HTTP {e.code}): {body[:200]}")

    return uploaded, errors


def verify_count():
    """GET count of rows in itx_documentation."""
    url = f"{SUPABASE_URL}/rest/v1/itx_documentation?select=chunk_id&limit=0"
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Prefer": "count=exact",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            content_range = resp.getheader("Content-Range", "")
            # Content-Range header looks like: "0-0/2200"
            if "/" in content_range:
                return int(content_range.split("/")[-1])
            return 0
    except Exception as e:
        print(f"Count verification failed: {e}")
        return -1


if __name__ == "__main__":
    print("=" * 64)
    print("DataSpark - Chroma to Supabase Migration")
    print("=" * 64)

    print(f"\nSource: {CHROMA_DB_PATH}")
    print(f"Target: {SUPABASE_URL}")

    # Step 1: Read from Chroma
    print("\n[1/3] Reading chunks from Chroma SQLite...")
    chunks = read_chroma_chunks()
    print(f"      Found {len(chunks)} documentation chunks")

    if not chunks:
        print("No chunks extracted - aborting.")
        sys.exit(1)

    # Step 2: Upload to Supabase
    print("\n[2/3] Uploading to Supabase itx_documentation table...")
    uploaded, errors = upload_to_supabase(chunks)

    # Step 3: Verify
    print("\n[3/3] Verifying row count in Supabase...")
    count = verify_count()
    if count > 0:
        print(f"      [OK] Supabase itx_documentation has {count} rows")
    else:
        print(f"      [WARN] Could not verify (count={count})")

    print(f"\n{'=' * 64}")
    print(f"Migration complete: {uploaded} uploaded, {errors} errors")
    print("=" * 64)
