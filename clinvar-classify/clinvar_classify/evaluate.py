"""Evaluation over the bundled set."""

from __future__ import annotations

import json
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from .predict import load_bundles, predict


# Map likely-X to X for top-line accuracy
COARSE = {
    "BENIGN": "BENIGN",
    "LIKELY_BENIGN": "BENIGN",
    "PATHOGENIC": "PATHOGENIC",
    "LIKELY_PATHOGENIC": "PATHOGENIC",
    "VUS": "VUS",
    "UNKNOWN": "UNKNOWN",
}


@dataclass
class EvalRow:
    variant: str
    truth: str
    pred: str
    mechanism: str
    confidence: float
    correct_coarse: bool


def evaluate(model: str, limit: int | None = None, label_filter: str | None = None) -> dict:
    bundles = load_bundles()
    truth_path = Path(__file__).parent.parent / "data" / "variants.jsonl"

    truth_lookup: dict[str, str] = {}
    for line in truth_path.read_text().splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        truth_lookup[row["variant"]] = row["truth"].upper()

    variants = list(bundles.keys())
    if label_filter:
        variants = [v for v in variants if truth_lookup[v] == label_filter.upper()]
    if limit:
        variants = variants[:limit]

    rows: list[EvalRow] = []
    for v in variants:
        pred = predict(bundles[v], model=model)
        truth_coarse = COARSE.get(truth_lookup[v], truth_lookup[v])
        pred_coarse = COARSE.get(pred.classification, pred.classification)
        rows.append(
            EvalRow(
                variant=v,
                truth=truth_lookup[v],
                pred=pred.classification,
                mechanism=pred.mechanism,
                confidence=pred.confidence,
                correct_coarse=truth_coarse == pred_coarse,
            )
        )

    return {
        "model": model,
        "n": len(rows),
        "accuracy_coarse": round(sum(r.correct_coarse for r in rows) / max(len(rows), 1), 4),
        "by_truth": _by_label(rows),
        "rows": [r.__dict__ for r in rows],
    }


def _by_label(rows: list[EvalRow]) -> dict:
    by_truth: dict[str, dict] = {}
    for label in {r.truth for r in rows}:
        subset = [r for r in rows if r.truth == label]
        by_truth[label] = {
            "n": len(subset),
            "recall": round(sum(r.correct_coarse for r in subset) / max(len(subset), 1), 4),
        }
    return by_truth
