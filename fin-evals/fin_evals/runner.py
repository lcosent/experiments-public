"""Eval runner: load task, call model, score, aggregate."""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path

from fin_evals.models import ModelSpec, complete
from fin_evals.task import Task


@dataclass
class ExampleResult:
    input: str
    target: object
    completion: str
    scores: dict
    latency_ms: int


@dataclass
class RunResult:
    task: str
    model: str
    n: int
    examples: list[ExampleResult]
    aggregate: dict
    seconds: float


def run(task: Task, spec: ModelSpec, limit: int | None = None) -> RunResult:
    examples = task.load()
    if limit:
        examples = examples[:limit]

    results: list[ExampleResult] = []
    t0 = time.time()

    for ex in examples:
        prompt = task.prompt(ex)
        start = time.time()
        completion = complete(spec, prompt)
        latency = int((time.time() - start) * 1000)
        scores = task.score(ex, completion)
        results.append(
            ExampleResult(
                input=ex.input[:200],
                target=ex.target,
                completion=completion[:200],
                scores=scores,
                latency_ms=latency,
            )
        )

    aggregate = _aggregate([r.scores for r in results])

    return RunResult(
        task=task.name,
        model=f"{spec.provider}:{spec.name}",
        n=len(results),
        examples=results,
        aggregate=aggregate,
        seconds=round(time.time() - t0, 2),
    )


def _aggregate(rows: list[dict]) -> dict:
    if not rows:
        return {}
    keys = set().union(*(r.keys() for r in rows))
    return {
        k: round(sum(r.get(k, 0.0) for r in rows) / len(rows), 4) for k in sorted(keys)
    }


def save(run_result: RunResult, runs_dir: Path = Path("runs")) -> Path:
    runs_dir.mkdir(parents=True, exist_ok=True)
    ts = time.strftime("%Y%m%d-%H%M%S")
    out = runs_dir / f"{run_result.task}_{ts}.json"
    out.write_text(json.dumps(asdict(run_result), indent=2))
    return out
