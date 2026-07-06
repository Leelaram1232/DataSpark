import sqlite3

def inspect():
    conn = sqlite3.connect('C:/Users/DELL/itx_vectordb/chroma.sqlite3')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables in chroma.sqlite3 and their row counts:")
    for table in tables:
        name = table[0]
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {name};")
            count = cursor.fetchone()[0]
            print(f"  {name}: {count} rows")
            if count > 0 and name not in ['migrations', 'acquire_write', 'tenants', 'databases', 'collections', 'embeddings_queue_config']:
                cursor.execute(f"SELECT * FROM {name} LIMIT 3;")
                rows = cursor.fetchall()
                print("    Sample Rows:")
                for r in rows:
                    print("      ", r)
        except Exception as e:
            print(f"  {name}: Error {e}")
            
    conn.close()

if __name__ == "__main__":
    inspect()
