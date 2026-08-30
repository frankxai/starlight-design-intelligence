#!/usr/bin/env python3
"""Validate liked-references/catalog.json. No network."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CATALOG = ROOT / "catalog.json"
REQUIRED_ROOT = ("version", "updated", "entries", "blocked_ingest")
REQUIRED_ENTRY = ("id", "status", "source_class", "why")
STATUSES = {"liked", "seed", "blocked", "rejected"}
CLASSES = {"instagram", "web-site", "product-cover", "brand-pack", "figma", "other"}


def run() -> int:
    if not CATALOG.is_file():
        print(f"FAIL missing {CATALOG}", file=sys.stderr)
        return 1
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    errors: list[str] = []
    for key in REQUIRED_ROOT:
        if key not in data:
            errors.append(f"root missing {key}")
    if not isinstance(data.get("entries"), list):
        errors.append("entries must be a list")
    if not isinstance(data.get("blocked_ingest"), list):
        errors.append("blocked_ingest must be a list")
    ids: set[str] = set()
    for i, entry in enumerate(data.get("entries") or []):
        if not isinstance(entry, dict):
            errors.append(f"entries[{i}] not object")
            continue
        for key in REQUIRED_ENTRY:
            if key not in entry:
                errors.append(f"entries[{i}] missing {key}")
        status = entry.get("status")
        if status not in STATUSES:
            errors.append(f"entries[{i}] bad status {status!r}")
        klass = entry.get("source_class")
        if klass not in CLASSES:
            errors.append(f"entries[{i}] bad source_class {klass!r}")
        eid = entry.get("id")
        if eid in ids:
            errors.append(f"duplicate id {eid}")
        ids.add(eid)
        if len(str(entry.get("why") or "")) < 8:
            errors.append(f"entries[{i}] why too short")
    if errors:
        print("FAIL")
        for err in errors:
            print(f" - {err}", file=sys.stderr)
        return 1
    print(f"OK entries={len(data['entries'])} blocked={len(data['blocked_ingest'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
