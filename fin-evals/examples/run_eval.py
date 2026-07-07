"""Minimal example: run two tasks against the local model."""

from fin_evals import runner, tasks
from fin_evals.models import ModelSpec


def main():
    spec = ModelSpec.parse("local")
    for name in ["term_sheet", "treasury_arithmetic"]:
        task = tasks.get(name)
        result = runner.run(task, spec, limit=3)
        print(f"\n=== {result.task}  ·  {result.model} ===")
        for k, v in result.aggregate.items():
            print(f"  {k:20s} {v:.4f}")
        print(f"  n={result.n}  total={result.seconds}s")


if __name__ == "__main__":
    main()
