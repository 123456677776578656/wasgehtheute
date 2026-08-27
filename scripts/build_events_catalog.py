#!/usr/bin/env python3
import datetime as dt
import difflib
import json
import re
import unicodedata
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "events-catalog.js"
TZ = ZoneInfo("Europe/Zurich")
TODAY = dt.datetime.now(TZ).date().isoformat()
EVENT_FILES = (
    "events-1.js", "events-2.js", "events-3.js", "events-nightlife.js",
    "events-nightlife-extra.js", "events-update-2026-08-24.js",
    "events-sargans-mels.js", "events-cantons-2026-08-25.js",
    "events-switzerland-2026-08-25.js",
)
STOP = {"und", "der", "die", "das", "ein", "eine", "für", "fuer", "von", "mit", "im", "in", "am", "auf", "zum", "zur", "the", "and"}


def norm(value):
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def extract_first_array(text):
    start = text.find("[")
    if start < 0:
        return []
    depth = 0
    quote = None
    escaped = False
    for i in range(start, len(text)):
        ch = text[i]
        if quote:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'"):
            quote = ch
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i + 1])
                except json.JSONDecodeError:
                    return []
    return []


def valid_date(value):
    try:
        dt.date.fromisoformat(str(value or "")[:10])
        return True
    except ValueError:
        return False


def source_rank(event):
    value = norm(event.get("source_type", ""))
    if any(x in value for x in ("offizielle quelle", "veranstalter", "official")):
        return 5
    if any(x in value for x in ("venue", "club", "bar", "location")):
        return 4
    if any(x in value for x in ("stadt", "gemeinde", "kommun")):
        return 3
    if any(x in value for x in ("tourismus", "tourism")):
        return 2
    if any(x in value for x in ("regional", "kalender")):
        return 1
    return 1 if event.get("source") else 0


def completeness(event):
    fields = ("title", "city", "region", "start", "end", "time", "venue", "source", "desc", "ticket", "price")
    return sum(bool(event.get(k)) for k in fields) + len(event.get("cats") or []) + source_rank(event) * 3


def title_similarity(a, b):
    a_words = [w for w in norm(a).split() if w not in STOP and len(w) > 2]
    b_words = [w for w in norm(b).split() if w not in STOP and len(w) > 2]
    if not a_words or not b_words:
        return 0.0
    token_ratio = len(set(a_words) & set(b_words)) / max(len(set(a_words)), len(set(b_words)))
    seq_ratio = difflib.SequenceMatcher(None, " ".join(a_words), " ".join(b_words)).ratio()
    return max(token_ratio, seq_ratio)


def normalize_event(raw):
    e = dict(raw)
    e["title"] = str(e.get("title") or "").strip()
    e["city"] = str(e.get("city") or "").strip()
    e["region"] = str(e.get("region") or "").strip()
    e["start"] = str(e.get("start") or "")[:10]
    e["end"] = str(e.get("end") or e.get("start") or "")[:10]
    e["time"] = str(e.get("time") or "").strip()
    e["venue"] = str(e.get("venue") or e.get("location") or "").strip()
    e["cats"] = list(dict.fromkeys(x for x in (e.get("cats") or []) if x))
    e["source"] = str(e.get("source") or "").strip()
    if e.get("ticket"):
        e["ticket"] = str(e["ticket"]).strip()
    if e.get("price"):
        e["price"] = str(e["price"]).strip()
    return e


def load_events():
    rows = []
    for filename in EVENT_FILES:
        path = ROOT / filename
        if not path.exists():
            continue
        arr = extract_first_array(path.read_text(encoding="utf-8"))
        for raw in arr if isinstance(arr, list) else []:
            if not isinstance(raw, dict):
                continue
            e = normalize_event(raw)
            if not e["title"] or not e["city"] or not valid_date(e["start"]) or not valid_date(e["end"]):
                continue
            if e["end"] < e["start"] or e["end"] < TODAY:
                continue
            rows.append(e)
    return rows


def dedupe(rows):
    clean = []
    removed = 0
    for e in rows:
        duplicate_index = -1
        for i, prev in enumerate(clean):
            if norm(prev.get("city")) != norm(e.get("city")) or prev.get("start") != e.get("start"):
                continue
            if norm(prev.get("title")) == norm(e.get("title")) or title_similarity(prev.get("title"), e.get("title")) >= 0.84:
                duplicate_index = i
                break
        if duplicate_index < 0:
            clean.append(e)
            continue
        removed += 1
        if completeness(e) > completeness(clean[duplicate_index]):
            clean[duplicate_index] = e
    clean.sort(key=lambda e: (e.get("start", ""), e.get("time", "99:99"), norm(e.get("city")), norm(e.get("title"))))
    return clean, removed


def main():
    raw = load_events()
    clean, removed = dedupe(raw)
    meta = {
        "generated_at": dt.datetime.now(TZ).isoformat(timespec="seconds"),
        "timezone": "Europe/Zurich",
        "source_files": list(EVENT_FILES),
        "raw_count": len(raw),
        "public_count": len(clean),
        "duplicates_removed": removed,
        "policy": "Öffentlicher zentraler Eventbestand; Rohdateien bleiben reine Importquellen.",
    }
    text = (
        "window.WGH_EVENT_CATALOG_META=" + json.dumps(meta, ensure_ascii=False, separators=(",", ":")) + ";\n"
        "window.EVENTS=(window.EVENTS||[]).concat(" + json.dumps(clean, ensure_ascii=False, separators=(",", ":")) + ");\n"
    )
    OUT.write_text(text, encoding="utf-8")
    print(f"Zentraler Eventkatalog: {len(clean)} kommende Events ({removed} Dubletten beim Build entfernt).")


if __name__ == "__main__":
    main()
