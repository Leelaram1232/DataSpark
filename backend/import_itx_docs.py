"""
DataSpark Backend — Sterling ITX Documentation Importer
Reads the 2200 sterling documentation chunks from SQLite / itx_chunks.json
and inserts them into the Supabase database.
"""
import os
import json
import sqlite3
from dotenv import load_dotenv

# Load env variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
CHROMA_DB_PATH = "C:/Users/DELL/itx_vectordb/chroma.sqlite3"
CHUNKS_JSON_PATH = "c:/Users/DELL/itx_chunks.json"

def run_import():
    print("=" * 60)
    print("DataSpark — Sterling ITX Documentation Importer")
    print("=" * 60)
    
    # Check if direct SQLAlchemy / Postgres connection is available
    if not DATABASE_URL or "YOUR_DB_PASSWORD" in DATABASE_URL:
        print("\n❌ DATABASE_URL is not set or still contains placeholder password.")
        print("Please configure DATABASE_URL in backend/.env before running this script.")
        print("We will search for documentation locally in the fallback local JSON and SQLite DB during server runtime.")
        return

    # Try importing psycopg2
    try:
        import psycopg2
    except ImportError:
        print("psycopg2 is not installed. Installing it now...")
        import subprocess
        subprocess.check_call(["pip", "install", "psycopg2-binary"])
        import psycopg2

    # 1. Connect to PostgreSQL
    try:
        # Convert asyncpg scheme to standard psycopg2
        pg_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        conn = psycopg2.connect(pg_url)
        cursor = conn.cursor()
        print("Connected to Supabase PostgreSQL!")
    except Exception as e:
        print(f"❌ Connection to Supabase failed: {e}")
        return

    # 2. Create target table
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.itx_documentation (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                chunk_id VARCHAR(255) UNIQUE NOT NULL,
                source VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        conn.commit()
        print("Table 'itx_documentation' verified/created.")
    except Exception as e:
        print(f"❌ Failed to create table: {e}")
        conn.rollback()
        conn.close()
        return

    # 3. Read chunks to insert
    chunks = []
    if os.path.exists(CHUNKS_JSON_PATH):
        try:
            print("Reading from c:/Users/DELL/itx_chunks.json...")
            with open(CHUNKS_JSON_PATH, "r", encoding="utf-8") as f:
                chunks = json.load(f)
        except Exception as e:
            print(f"⚠️ Error reading JSON chunks: {e}")
            
    if not chunks and os.path.exists(CHROMA_DB_PATH):
        try:
            print("Fallback: Reading from chroma.sqlite3...")
            sqlite_conn = sqlite3.connect(CHROMA_DB_PATH)
            c = sqlite_conn.cursor()
            c.execute("SELECT id, string_value FROM embedding_fulltext_search_content")
            rows = c.fetchall()
            for r in rows:
                chunks.append({
                    "chunk_id": f"itx_doc_{r[0]}",
                    "source": "IBM Sterling ITX Documentation",
                    "content": r[1]
                })
            sqlite_conn.close()
        except Exception as e:
            print(f"⚠️ Error reading SQLite DB: {e}")

    if not chunks:
        print("❌ No documentation chunks found to import.")
        conn.close()
        return

    print(f"Found {len(chunks)} chunks to import. Beginning batch insert...")

    # 4. Insert chunks in batches
    success_count = 0
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        try:
            for c in batch:
                cursor.execute("""
                    INSERT INTO public.itx_documentation (chunk_id, source, content)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (chunk_id) DO UPDATE 
                    SET content = EXCLUDED.content
                """, (
                    c.get("chunk_id", f"gen_{success_count}"),
                    c.get("source", "IBM ITX Docs"),
                    c.get("content", "")
                ))
            conn.commit()
            success_count += len(batch)
            print(f"  Imported {success_count}/{len(chunks)} chunks...")
        except Exception as e:
            print(f"⚠️ Batch error: {e}")
            conn.rollback()

    print(f"\n✅ Import completed! Loaded {success_count} documentation chunks into Supabase.")
    conn.close()

if __name__ == "__main__":
    run_import()
