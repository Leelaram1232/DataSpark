"""
EDI Standards Data Loader
Loads hierarchical segment/element/group structures for supported standards.
"""
import json
import os
from typing import Dict, Any, Optional, List

STANDARDS_DIR = os.path.dirname(os.path.abspath(__file__))

# Map of (standard, transaction) -> filename
_FILE_MAP = {
    # ANSI X12
    ("ANSI_X12", "204"): "x12_204.json",
    ("ANSI_X12", "210"): "x12_210.json",
    ("ANSI_X12", "214"): "x12_214.json",
    ("ANSI_X12", "310"): "x12_310.json",
    ("ANSI_X12", "315"): "x12_315.json",
    ("ANSI_X12", "810"): "x12_810.json",
    ("ANSI_X12", "820"): "x12_820.json",
    ("ANSI_X12", "824"): "x12_824.json",
    ("ANSI_X12", "830"): "x12_830.json",
    ("ANSI_X12", "850"): "x12_850.json",
    ("ANSI_X12", "855"): "x12_855.json",
    ("ANSI_X12", "856"): "x12_856.json",
    ("ANSI_X12", "940"): "x12_940.json",
    ("ANSI_X12", "943"): "x12_943.json",
    ("ANSI_X12", "945"): "x12_945.json",
    ("ANSI_X12", "997"): "x12_997.json",
    # EDIFACT
    ("EDIFACT", "ORDERS"): "edifact_ORDERS.json",
    ("EDIFACT", "INVOIC"): "edifact_INVOIC.json",
    ("EDIFACT", "DESADV"): "edifact_DESADV.json",
    ("EDIFACT", "IFTSTA"): "edifact_IFTSTA.json",
    ("EDIFACT", "PREADV"): "edifact_PREADV.json",
    ("EDIFACT", "RECADV"): "edifact_RECADV.json",
    ("EDIFACT", "APERAK"): "edifact_APERAK.json",
    ("EDIFACT", "INVRPT"): "edifact_INVRPT.json",
}

# In-memory cache
_cache: Dict[str, Any] = {}


def load_standard(standard: str, transaction: str) -> Optional[Dict[str, Any]]:
    """
    Load the hierarchical structure for a given standard and transaction set.
    Returns the full JSON dict or None if not found.
    """
    cache_key = f"{standard}_{transaction}"
    if cache_key in _cache:
        return _cache[cache_key]

    filename = _FILE_MAP.get((standard, transaction))
    if not filename:
        return None

    filepath = os.path.join(STANDARDS_DIR, filename)
    if not os.path.exists(filepath):
        return None

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    _cache[cache_key] = data
    return data


def get_tree_nodes(standard: str, transaction: str) -> List[Dict[str, Any]]:
    """
    Returns the tree structure array ready for the frontend TypeTreePanel.
    """
    data = load_standard(standard, transaction)
    if not data:
        return []
    return data.get("structure", [])


def get_standard_info(standard: str, transaction: str) -> Dict[str, str]:
    """
    Returns metadata about the standard (name, version, badge).
    """
    data = load_standard(standard, transaction)
    if not data:
        return {"name": f"{standard} {transaction}", "version": "Unknown", "badge": standard[:3]}
    return {
        "name": data.get("name", f"{standard} {transaction}"),
        "version": data.get("version", "Unknown"),
        "badge": data.get("badge", standard[:3]),
    }


def list_available_standards() -> List[Dict[str, str]]:
    """
    Returns a list of all available standards that have JSON files.
    """
    available = []
    for (std, txn), filename in _FILE_MAP.items():
        filepath = os.path.join(STANDARDS_DIR, filename)
        if os.path.exists(filepath):
            available.append({"standard": std, "transaction": txn, "file": filename})
    return available


def count_fields(nodes: List[Dict]) -> int:
    """Recursively count leaf fields in a tree."""
    count = 0
    for node in nodes:
        children = node.get("children", [])
        if not children:
            count += 1
        else:
            count += count_fields(children)
    return count
