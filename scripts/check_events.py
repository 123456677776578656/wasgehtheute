#!/usr/bin/env python3
import concurrent.futures
import datetime as dt
import difflib
import html
import json
import re
import ssl
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "event-health.js"
TZ = ZoneInfo("Europe/Zurich")
TODAY = dt.datetime.now(TZ).date().isoformat()
USER_AGENT = "Mozilla/5.0 (compatible; WasGehtHeute-EventCheck/3.0; +https://wasgehtheute.ch/)"
EVENT_FILES = (
    "events-1.js", "events-2.js", "events-3.js", "events-nightlife.js",
    "events-nightlife-extra.js", "events-update-2026-08-24.js",
    "events-sargans-mels.js", "events-cantons-2026-08-25.js",
    "events-switzerland-2026-08-25.js",
)
CANCEL_WORDS = ("abgesagt", "annulliert", "cancelled", "canceled", "findet nicht statt", "veranstaltung abgesagt")
CHANGE_WORDS = ("verschoben", "verlegt", "postponed", "neuer termin", "terminänderung", "terminaenderung", "neues datum")
SOLD_OUT_WORDS = ("ausverkauft", "sold out", "keine tickets mehr", "tickets ausverkauft")
STOP = {"und", "der", "die", "das", "ein", "eine", "für", "fuer", "von", "mit", "im", "in", "am", "auf", "zum", "zur", "the", "and"}


def norm(value):
    value = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", norm(value)).strip("-")


def eid(event):
    return slug(f"{event.get('title','')}-{event.get('city','')}-{event.get('start','')}")


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
    for filename in EVENT_FILES:
        path = ROOT / filename
        if not path.exists():
            continue
        arr = extract_first_array(path.read_text(encoding="utf-8"))
        if isinstance(arr, list):
            for event in arr:
                if isinstance(event, dict):
                    item = dict(event)
                    item["_file"] = filename
                    events.append(item)
    return events


def valid_date(value):
    try:
        dt.date.fromisoformat(str(value or "")[:10])
        return True
    except ValueError:
        return False


def validate_event(event):
    issues = []
    required = (("title", "Titel fehlt"), ("city", "Ort fehlt"), ("region", "Region fehlt"),
                ("start", "Startdatum fehlt"), ("end", "Enddatum fehlt"), ("source", "Quelle fehlt"))
    for field, reason in required:
        if not event.get(field):
            issues.append(reason)
    if not isinstance(event.get("cats"), list) or not event.get("cats"):
        issues.append("Kategorie fehlt")
    if event.get("start") and not valid_date(event.get("start")):
        issues.append("Startdatum ungültig")
    if event.get("end") and not valid_date(event.get("end")):
        issues.append("Enddatum ungültig")
    if valid_date(event.get("start")) and valid_date(event.get("end")) and str(event["end"])[:10] < str(event["start"])[:10]:
        issues.append("Enddatum liegt vor Startdatum")
    source = event.get("source", "")
    if source and not str(source).startswith(("http://", "https://")):
        issues.append("Quellen-URL ungültig")
    ticket = event.get("ticket", "")
    if ticket and not str(ticket).startswith(("http://", "https://")):
        issues.append("Ticket-URL ungültig")
    if not event.get("venue"):
        issues.append("Venue fehlt")
    if not event.get("time"):
        issues.append("Uhrzeit fehlt")
    return issues


def fetch_url(url):
    result = {"url": url, "source_ok": None, "http_status": None, "body": "", "reason": ""}
    if not isinstance(url, str) or not url.startswith(("http://", "https://")):
        result.update(source_ok=False, reason="Ungültige Quellen-URL")
        return result
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=12, context=ssl.create_default_context()) as resp:
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
            result.update(source_ok=False, reason=f"Quelle antwortet mit HTTP {exc.code}")
        else:
            result["reason"] = f"Quelle konnte nicht eindeutig geprüft werden (HTTP {exc.code})"
    except Exception as exc:
        result["reason"] = f"Quelle konnte nicht eindeutig geprüft werden ({type(exc).__name__})"
    return result


def page_text(raw):
    raw = re.sub(r"<script\b[^>]*>.*?</script>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<style\b[^>]*>.*?</style>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", norm(html.unescape(raw)))


def title_window(title, text):
    words = [w for w in norm(title).split() if len(w) >= 4 and w not in STOP]
    if not words or not text:
        return ""
    positions = [text.find(w) for w in words[:5] if text.find(w) >= 0]
    if not positions:
        return ""
    pos = min(positions)
    window = text[max(0, pos - 500):min(len(text), pos + 1200)]
    needed = 1 if len(words) == 1 else 2
    return window if sum(1 for w in words[:5] if w in window) >= needed else ""


def detect_flags(event, raw_body):
    window = title_window(event.get("title", ""), page_text(raw_body))
    if not window:
        return False, False, False
    return (
        any(norm(w) in window for w in CANCEL_WORDS),
        any(norm(w) in window for w in CHANGE_WORDS),
        any(norm(w) in window for w in SOLD_OUT_WORDS),
    )


def title_similarity(a, b):
    a_words = [w for w in norm(a).split() if w not in STOP and len(w) > 2]
    b_words = [w for w in norm(b).split() if w not in STOP and len(w) > 2]
    if not a_words or not b_words:
        return 0.0
    token_ratio = len(set(a_words) & set(b_words)) / max(len(set(a_words)), len(set(b_words)))
    seq_ratio = difflib.SequenceMatcher(None, " ".join(a_words), " ".join(b_words)).ratio()
    return max(token_ratio, seq_ratio)


def find_duplicates(events):
    exact, fuzzy = [], []
    seen = {}
    for event in events:
        key = eid(event)
        if key in seen:
            exact.append({"id": key, "first_file": seen[key]["_file"], "duplicate_file": event.get("_file", "")})
        else:
            seen[key] = event
    for i, event in enumerate(events):
        for other in events[i + 1:]:
            if norm(event.get("city")) != norm(other.get("city")) or event.get("start") != other.get("start"):
                continue
            if eid(event) == eid(other):
                continue
            similarity = title_similarity(event.get("title"), other.get("title"))
            if similarity >= 0.82:
                fuzzy.append({"first": eid(event), "second": eid(other), "city": event.get("city", ""), "start": event.get("start", ""), "similarity": round(similarity, 2)})
    return exact, fuzzy


def main():
    events = load_events()
    all_issues = []
    for event in events:
        for reason in validate_event(event):
            all_issues.append({"id": eid(event), "title": event.get("title", "Ohne Titel"), "file": event.get("_file", ""), "reason": reason})
    upcoming = [e for e in events if valid_date(e.get("end")) and str(e.get("end"))[:10] >= TODAY]
    sources = sorted({e.get("source") for e in upcoming if e.get("source") and str(e.get("source")).startswith(("http://", "https://"))})
    checks = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        jobs = {pool.submit(fetch_url, url): url for url in sources}
        for future in concurrent.futures.as_completed(jobs):
            checks[jobs[future]] = future.result()

    exact_duplicates, fuzzy_duplicates = find_duplicates(upcoming)
    health = {}
    for event in upcoming:
        event_id = eid(event)
        if not event_id:
            continue
        check = checks.get(event.get("source"), {})
        cancelled, changed, sold_out = detect_flags(event, check.get("body", "")) if check.get("source_ok") is True else (False, False, False)
        explicit = norm(event.get("status", ""))
        item = {
            "source_ok": check.get("source_ok"),
            "http_status": check.get("http_status"),
            "attempted_at": TODAY,
            "source_rank": source_rank(event),
            "possible_cancelled": bool(cancelled or explicit in {"cancelled", "canceled", "abgesagt"}),
            "possible_changed": bool(changed or explicit in {"postponed", "verschoben", "verlegt", "changed"}),
            "possible_sold_out": bool(sold_out or explicit in {"ausverkauft", "sold out", "sold-out"}),
        }
        # "checked_at" bedeutet bewusst: Die Originalquelle war bei diesem Lauf tatsächlich erreichbar.
        # Ein Timeout, HTTP-Fehler oder Bot-Schutz darf das öffentliche Prüfdatum nicht künstlich erneuern.
        if check.get("source_ok") is True:
            item["checked_at"] = TODAY
        reason = check.get("reason", "")
        if item["possible_cancelled"]:
            reason = reason or "Auf der Originalquelle wurde ein möglicher Absage-Hinweis erkannt."
        elif item["possible_changed"]:
            reason = reason or "Auf der Originalquelle wurde ein möglicher Hinweis auf eine Terminänderung erkannt."
        elif item["possible_sold_out"]:
            reason = reason or "Auf der Originalquelle wurde ein möglicher Ausverkauft-Hinweis erkannt."
        if reason:
            item["reason"] = reason
        health[event_id] = item

    total = len(upcoming)
    metrics = {
        "upcoming": total,
        "with_source": sum(bool(e.get("source")) for e in upcoming),
        "official_or_direct_source": sum(source_rank(e) >= 3 for e in upcoming),
        "with_venue": sum(bool(e.get("venue")) for e in upcoming),
        "with_ticket": sum(bool(e.get("ticket")) for e in upcoming),
        "with_price": sum(bool(e.get("price")) or "Gratis" in (e.get("cats") or []) for e in upcoming),
        "source_verified_now": sum(health.get(eid(e), {}).get("source_ok") is True for e in upcoming),
        "source_failures": sum(health.get(eid(e), {}).get("source_ok") is False for e in upcoming),
        "source_inconclusive": sum(health.get(eid(e), {}).get("source_ok") is None for e in upcoming),
        "possible_cancelled": sum(health.get(eid(e), {}).get("possible_cancelled") is True for e in upcoming),
        "possible_changed": sum(health.get(eid(e), {}).get("possible_changed") is True for e in upcoming),
    }
    payload = {
        "attempted_at": TODAY,
        "checked_at": TODAY if metrics["source_verified_now"] else "",
        "events": health,
        "duplicates": exact_duplicates,
        "fuzzy_duplicates": fuzzy_duplicates,
        "issues": all_issues,
        "metrics": metrics,
        "policy": "Health-Check markiert nur belegte Warnungen, setzt Prüfdatum nur bei erreichbarer Quelle und überschreibt Eventdaten niemals automatisch.",
    }
    OUT.write_text("window.WGH_EVENT_HEALTH=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"Geprüft: {total} kommende Events, {len(sources)} Quellen, {len(exact_duplicates)} exakte + {len(fuzzy_duplicates)} mögliche Dubletten, {len(all_issues)} Datenhinweise")


if __name__ == "__main__":
    main()
