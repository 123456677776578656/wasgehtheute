#!/usr/bin/env python3
import concurrent.futures
import datetime as dt
import glob
import html
import json
import re
import ssl
import time
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "event-health.js"
TODAY = dt.datetime.now(dt.timezone.utc).date().isoformat()
USER_AGENT = "Mozilla/5.0 (compatible; WasGehtHeute-EventCheck/1.0; +https://123456677776578656.github.io/wasgehtheute/)"
CANCEL_WORDS = ("abgesagt", "abgesage", "annulliert", "cancelled", "canceled", "abbruch", "findet nicht statt")
CHANGE_WORDS = ("verschoben", "verlegt", "postponed", "neuer termin", "terminänderung", "terminaenderung")
STOP = {"und", "der", "die", "das", "ein", "eine", "für", "fuer", "von", "mit", "im", "in", "am", "auf", "zum", "zur", "the", "and"}


def norm(value):
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", norm(value)).strip("-")


def eid(event):
    return slug(f"{event.get('title','')}-{event.get('city','')}-{event.get('start','')}")


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


def load_events():
    events = []
    for name in sorted(glob.glob(str(ROOT / "events-*.js"))):
        if name.endswith("event-health.js"):
            continue
        text = Path(name).read_text(encoding="utf-8")
        arr = extract_first_array(text)
        if isinstance(arr, list):
            for e in arr:
                if isinstance(e, dict):
                    item = dict(e)
                    item["_file"] = Path(name).name
                    events.append(item)
    return events


def fetch_url(url):
    result = {"url": url, "source_ok": None, "http_status": None, "body": "", "reason": ""}
    if not isinstance(url, str) or not url.startswith(("http://", "https://")):
        result.update(source_ok=False, reason="Ungültige Quellen-URL")
        return result
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8"})
    try:
        ctx = ssl.create_default_context()
        with urllib.request.urlopen(req, timeout=12, context=ctx) as resp:
            status = getattr(resp, "status", 200) or 200
            ctype = resp.headers.get("Content-Type", "")
            raw = resp.read(350000)
            result["http_status"] = status
            result["source_ok"] = 200 <= status < 400
            if "text" in ctype or "html" in ctype or not ctype:
                result["body"] = raw.decode("utf-8", "ignore")
    except urllib.error.HTTPError as exc:
        result["http_status"] = exc.code
        if exc.code in (404, 410):
            result["source_ok"] = False
            result["reason"] = f"Quelle antwortet mit HTTP {exc.code}"
        else:
            result["reason"] = f"Quelle konnte nicht eindeutig geprüft werden (HTTP {exc.code})"
    except Exception as exc:
        result["reason"] = f"Quelle konnte nicht eindeutig geprüft werden ({type(exc).__name__})"
    return result


def page_text(raw):
    raw = re.sub(r"<script\b[^>]*>.*?</script>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<style\b[^>]*>.*?</style>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = html.unescape(raw)
    return re.sub(r"\s+", " ", norm(raw))


def title_window(title, text):
    words = [w for w in norm(title).split() if len(w) >= 4 and w not in STOP]
    if not words or not text:
        return ""
    pos = text.find(words[0])
    if pos < 0:
        return ""
    lo, hi = max(0, pos - 500), min(len(text), pos + 1000)
    window = text[lo:hi]
    needed = 1 if len(words) == 1 else 2
    if sum(1 for w in words[:5] if w in window) < needed:
        return ""
    return window


def detect_change(event, raw_body):
    text = page_text(raw_body)
    window = title_window(event.get("title", ""), text)
    if not window:
        return False, False
    cancelled = any(norm(w) in window for w in CANCEL_WORDS)
    changed = any(norm(w) in window for w in CHANGE_WORDS)
    return cancelled, changed


def main():
    events = load_events()
    upcoming = [e for e in events if str(e.get("end", "")) >= TODAY]
    sources = sorted({e.get("source") for e in upcoming if e.get("source")})
    checks = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        jobs = {pool.submit(fetch_url, url): url for url in sources}
        for future in concurrent.futures.as_completed(jobs):
            checks[jobs[future]] = future.result()

    by_key = {}
    duplicates = []
    health = {}
    for event in upcoming:
        event_id = eid(event)
        if not event_id:
            continue
        key = event_id
        if key in by_key:
            duplicates.append({"id": event_id, "first_file": by_key[key], "duplicate_file": event.get("_file", "")})
        else:
            by_key[key] = event.get("_file", "")

        check = checks.get(event.get("source"), {})
        cancelled, changed = detect_change(event, check.get("body", "")) if check.get("source_ok") else (False, False)
        explicit = norm(event.get("status", ""))
        item = {
            "source_ok": check.get("source_ok"),
            "http_status": check.get("http_status"),
            "checked_at": TODAY,
            "possible_cancelled": bool(cancelled or explicit in {"cancelled", "canceled", "abgesagt"}),
            "possible_changed": bool(changed or explicit in {"postponed", "verschoben", "verlegt"}),
        }
        reason = check.get("reason", "")
        if item["possible_cancelled"]:
            reason = reason or "Auf der Quelle wurde im Umfeld des Eventtitels ein Absage-Hinweis erkannt."
        elif item["possible_changed"]:
            reason = reason or "Auf der Quelle wurde im Umfeld des Eventtitels ein Hinweis auf eine Terminänderung erkannt."
        if reason:
            item["reason"] = reason
        health[event_id] = item

    payload = {"checked_at": TODAY, "events": health, "duplicates": duplicates}
    OUT.write_text("window.WGH_EVENT_HEALTH=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"Geprüft: {len(upcoming)} kommende Events, {len(sources)} Quellen, {len(duplicates)} exakte Duplikate")


if __name__ == "__main__":
    main()
