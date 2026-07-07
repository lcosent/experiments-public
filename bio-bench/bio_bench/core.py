"""Eval primitives. Single file: Task, Example, Model, Runner, scoring."""

from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass, field
from pathlib import Path

from openai import OpenAI


# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------


@dataclass
class Example:
    input: str
    target: object
    meta: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Scorers
# ---------------------------------------------------------------------------


def label_match(pred: str, labels: list[str]) -> float:
    p = pred.strip().lower()
    return 1.0 if any(lbl.lower() in p for lbl in labels) else 0.0


def numeric_within(pred: str, target: float, tol: float) -> float:
    nums = re.findall(r"-?\d+\.?\d*(?:[eE]-?\d+)?", pred)
    if not nums:
        return 0.0
    try:
        value = float(nums[0])
    except ValueError:
        return 0.0
    return 1.0 if abs(value - target) <= tol else 0.0


def contains(pred: str, needle: str) -> float:
    return 1.0 if needle.lower() in pred.lower() else 0.0


# ---------------------------------------------------------------------------
# Model adapter (OpenAI-compatible)
# ---------------------------------------------------------------------------


def call_model(model: str, prompt: str, max_tokens: int = 256) -> str:
    if model == "local" or model.startswith("local:"):
        base = os.environ.get("BIO_BENCH_BASE_URL", "http://localhost:8000/v1")
        api_key = "local"
        name = "chat" if model == "local" else model.split(":", 1)[1]
    elif model.startswith("openai:"):
        base = "https://api.openai.com/v1"
        api_key = os.environ.get("OPENAI_API_KEY", "")
        name = model.split(":", 1)[1]
    elif model.startswith("anthropic:"):
        base = "https://api.anthropic.com/v1"
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        name = model.split(":", 1)[1]
    else:
        raise ValueError(f"unknown model spec: {model}")

    client = OpenAI(base_url=base, api_key=api_key)
    resp = client.chat.completions.create(
        model=name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.0,
    )
    return resp.choices[0].message.content or ""


# ---------------------------------------------------------------------------
# Task base
# ---------------------------------------------------------------------------


class Task:
    name: str = ""
    dataset: str = ""

    def load(self) -> list[Example]:
        path = Path(__file__).parent.parent / self.dataset
        examples = []
        for line in path.read_text().splitlines():
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            examples.append(Example(row["input"], row["target"], row.get("meta", {})))
        return examples

    def prompt(self, ex: Example) -> str:
        raise NotImplementedError

    def score(self, ex: Example, completion: str) -> dict[str, float]:
        raise NotImplementedError


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------


@dataclass
class RunResult:
    task: str
    model: str
    n: int
    aggregate: dict
    rows: list[dict]
    seconds: float


def run(task: Task, model: str, limit: int | None = None) -> RunResult:
    examples = task.load()
    if limit:
        examples = examples[:limit]
    rows = []
    t0 = time.time()
    for ex in examples:
        completion = call_model(model, task.prompt(ex))
        scores = task.score(ex, completion)
        rows.append(
            {
                "input": ex.input[:160],
                "target": ex.target,
                "completion": completion[:200],
                "scores": scores,
            }
        )
    keys = set().union(*(r["scores"].keys() for r in rows)) if rows else set()
    aggregate = {
        k: round(sum(r["scores"].get(k, 0.0) for r in rows) / max(len(rows), 1), 4)
        for k in sorted(keys)
    }
    return RunResult(
        task=task.name,
        model=model,
        n=len(rows),
        aggregate=aggregate,
        rows=rows,
        seconds=round(time.time() - t0, 2),
    )


def save(result: RunResult, runs_dir: Path = Path("runs")) -> Path:
    runs_dir.mkdir(parents=True, exist_ok=True)
    ts = time.strftime("%Y%m%d-%H%M%S")
    out = runs_dir / f"{result.task}_{ts}.json"
    out.write_text(json.dumps(result.__dict__, indent=2, default=str))
    return out
