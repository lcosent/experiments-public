"""Quick demo of the simulation."""

from pathlib import Path

from rsu_optimizer.profile import load
from rsu_optimizer.simulate import simulate


def main():
    p = load(Path("profiles/example.yaml"))
    results = simulate(p, runs=200)
    for r in results:
        print(f"{r.name:20s}  median=${r.median:,.0f}  p25=${r.p25:,.0f}  p75=${r.p75:,.0f}")


if __name__ == "__main__":
    main()
