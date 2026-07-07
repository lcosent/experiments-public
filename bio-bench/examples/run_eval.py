"""Run two task families against the local model."""

from bio_bench import core, tasks


def main():
    for name in ["dose_response", "unit_arithmetic"]:
        task = tasks.get(name)
        result = core.run(task, model="local", limit=3)
        print(f"\n=== {result.task}  ·  {result.model} ===")
        for k, v in result.aggregate.items():
            print(f"  {k:20s} {v:.4f}")
        print(f"  n={result.n}  total={result.seconds}s")


if __name__ == "__main__":
    main()
