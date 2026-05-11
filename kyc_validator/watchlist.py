"""Local sanctions list matching. Names normalized, fuzzy match with rapidfuzz."""

from __future__ import annotations

import csv
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from rapidfuzz import fuzz


WATCHLIST_DIR = Path(__file__).parent.parent / "watchlists"


@dataclass
class WatchlistHit:
    list_name: str
    matched_name: str
    score: float


def normalize_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return " ".join(s.upper().split())


def load_list(path: Path) -> list[str]:
    if not path.exists():
        return []
    names: list[str] = []
    with path.open() as f:
        reader = csv.reader(f)
        for row in reader:
            if row:
                names.append(normalize_name(row[0]))
    return names


def check(name: str | None, threshold: int = 92) -> list[WatchlistHit]:
    if not name:
        return []
    target = normalize_name(name)
    hits: list[WatchlistHit] = []
    for path in WATCHLIST_DIR.glob("*.csv"):
        names = load_list(path)
        for candidate in names:
            score = fuzz.WRatio(target, candidate)
            if score >= threshold:
                hits.append(WatchlistHit(list_name=path.stem, matched_name=candidate, score=score))
                break
    return hits
