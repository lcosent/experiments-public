"""Deterministic scorers. No LLM-as-judge."""

from __future__ import annotations

import re


def exact_match(pred: str, target: str) -> float:
    return 1.0 if pred.strip().lower() == str(target).strip().lower() else 0.0


def numeric_within(pred: str, target: float, tol: float) -> float:
    nums = re.findall(r"-?\d+\.?\d*", pred)
    if not nums:
        return 0.0
    try:
        value = float(nums[0])
    except ValueError:
        return 0.0
    return 1.0 if abs(value - target) <= tol else 0.0


def label_match(pred: str, labels: list[str]) -> float:
    p = pred.strip().lower()
    for lbl in labels:
        if lbl.lower() in p:
            return 1.0
    return 0.0


def contains_clause(pred: str, clause: str) -> float:
    return 1.0 if clause.lower() in pred.lower() else 0.0
