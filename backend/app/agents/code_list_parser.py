"""
Enterprise Code List & Lookup Table Engine
Parses uploaded CSV, XLSX, JSON, XML, XSD, TXT files into structured, searchable Lookup Tables.
"""
import json
import csv
import io
from typing import Dict, Any, List, Optional


class CodeListEngine:
    def __init__(self):
        self.lookup_tables: Dict[str, Dict[str, Any]] = {}

    def parse_file(self, filename: str, content_bytes: bytes) -> Dict[str, Any]:
        """
        Parse raw bytes from an uploaded code list file into a structured lookup table dictionary.
        """
        name_clean = filename.rsplit(".", 1)[0].replace("-", "_").replace(" ", "_")
        entries = []
        key_map = {}
        value_map = {}

        text_content = content_bytes.decode("utf-8", errors="ignore")

        if filename.endswith(".json"):
            try:
                data = json.loads(text_content)
                items = data if isinstance(data, list) else data.get("entries", data.get("data", []))
                for item in items:
                    if isinstance(item, dict):
                        code = str(item.get("code") or item.get("key") or item.get("id") or "").strip()
                        val = str(item.get("value") or item.get("name") or item.get("val") or "").strip()
                        desc = str(item.get("description") or item.get("desc") or "")
                        if code and val:
                            entries.append({"code": code, "value": val, "description": desc})
                            key_map[code.lower()] = val
                            value_map[val.lower().replace(" ", "")] = code
            except Exception as e:
                print(f"[CodeListEngine] JSON parse error in {filename}: {e}")

        else:
            # CSV / TSV / TXT parsing
            reader = csv.reader(io.StringIO(text_content))
            for idx, row in enumerate(reader):
                if idx == 0 and any(h in row[0].lower() for h in ["code", "key", "id", "header"]):
                    continue  # skip header
                if len(row) >= 2:
                    code = row[0].strip()
                    val = row[1].strip()
                    desc = row[2].strip() if len(row) > 2 else ""
                    if code and val:
                        entries.append({"code": code, "value": val, "description": desc})
                        key_map[code.lower()] = val
                        value_map[val.lower().replace(" ", "")] = code

        table_data = {
            "id": f"code_list_{name_clean.lower()}",
            "name": name_clean,
            "filename": filename,
            "total_entries": len(entries),
            "entries": entries,
            "key_map": key_map,
            "value_map": value_map,
        }

        self.lookup_tables[table_data["id"]] = table_data
        return table_data

    def find_lookup_for_field(self, field_name: str) -> Optional[Dict[str, Any]]:
        """
        Match a field name against available lookup tables.
        """
        fn = field_name.lower()
        for table_id, table in self.lookup_tables.items():
            t_name = table["name"].lower()
            if "state" in fn and "state" in t_name:
                return table
            if ("country" in fn or "nation" in fn) and "country" in t_name:
                return table
            if ("status" in fn or "type" in fn) and ("status" in t_name or "type" in t_name):
                return table

        return None
