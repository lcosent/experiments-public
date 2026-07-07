"""Run evaluation on the bundled set with the local model."""

from clinvar_classify.evaluate import evaluate


def main():
    result = evaluate(model="local", limit=10)
    print(f"\n=== {result['model']}  ·  n={result['n']} ===")
    print(f"overall coarse accuracy: {result['accuracy_coarse']:.4f}")
    for truth, stats in sorted(result["by_truth"].items()):
        print(f"  {truth:18s} n={stats['n']:3d}  recall={stats['recall']:.4f}")


if __name__ == "__main__":
    main()
