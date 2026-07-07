"""Compare this week's themes against last week's. Emerging / continuing / receding."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np


@dataclass
class ThemeRow:
    theme: str
    note: str
    count: int
    centroid: list[float]
    paper_ids: list[str]


@dataclass
class ThemeDiff:
    emerging: list[tuple[ThemeRow, int]]  # (this_week, prev_count)
    continuing: list[tuple[ThemeRow, int]]
    receding: list[tuple[str, int]]  # (theme, prev_count)


def load_previous(state_dir: Path) -> list[ThemeRow]:
    files = sorted(state_dir.glob("themes_*.json"), reverse=True)
    if not files:
        return []
    rows = json.loads(files[0].read_text())
    return [ThemeRow(**r) for r in rows]


def save_current(state_dir: Path, label: str, rows: list[ThemeRow]) -> Path:
    state_dir.mkdir(parents=True, exist_ok=True)
    out = state_dir / f"themes_{label}.json"
    out.write_text(json.dumps([r.__dict__ for r in rows], indent=2))
    return out


def diff(current: list[ThemeRow], previous: list[ThemeRow], threshold: float = 0.78) -> ThemeDiff:
    """Match current themes to previous via cosine similarity on centroids."""
    emerging: list[tuple[ThemeRow, int]] = []
    continuing: list[tuple[ThemeRow, int]] = []
    receding: list[tuple[str, int]] = []

    prev_centroids = np.array([p.centroid for p in previous]) if previous else np.zeros((0,))
    used_prev = set()

    for cur in current:
        if not previous:
            emerging.append((cur, 0))
            continue
        c = np.array(cur.centroid)
        c = c / (np.linalg.norm(c) + 1e-9)
        sims = prev_centroids @ c
        sims = sims / (np.linalg.norm(prev_centroids, axis=1) + 1e-9)
        best = int(np.argmax(sims))
        if sims[best] >= threshold and best not in used_prev:
            continuing.append((cur, previous[best].count))
            used_prev.add(best)
        else:
            emerging.append((cur, 0))

    for i, prev in enumerate(previous):
        if i not in used_prev:
            receding.append((prev.theme, prev.count))

    return ThemeDiff(emerging=emerging, continuing=continuing, receding=receding)
