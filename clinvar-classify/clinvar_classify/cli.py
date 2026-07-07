from __future__ import annotations

import json

import click
from rich.console import Console
from rich.table import Table

from .evaluate import evaluate
from .predict import load_bundles, predict


console = Console()


@click.group()
def main():
    """clinvar-classify: LLM-assisted variant classification."""


@main.command("predict")
@click.option("--variant", required=True, help='e.g. "BRCA1 c.5266dupC"')
@click.option("--model", default="local")
def predict_cmd(variant: str, model: str):
    bundles = load_bundles()
    if variant not in bundles:
        console.print(f"[red]variant not in bundled set:[/red] {variant}")
        console.print("Available examples:")
        for v in list(bundles.keys())[:10]:
            console.print(f"  • {v}")
        return
    pred = predict(bundles[variant], model=model)
    console.print(f"[bold]variant[/bold]      {variant}")
    console.print(f"prediction    [bold]{pred.classification}[/bold]  (confidence {pred.confidence:.2f})")
    console.print(f"mechanism     {pred.mechanism}")
    console.print(f"rationale     {pred.rationale}")


@main.command("eval")
@click.option("--model", default="local")
@click.option("--limit", type=int, default=None)
@click.option("--filter", "label_filter", default=None,
              help="Only evaluate ground-truth label of this name")
def eval_cmd(model: str, limit: int | None, label_filter: str | None):
    result = evaluate(model=model, limit=limit, label_filter=label_filter)
    table = Table(title=f"clinvar-classify · {result['model']}  ·  n={result['n']}")
    table.add_column("truth")
    table.add_column("n", justify="right")
    table.add_column("recall (coarse)", justify="right")
    for truth, stats in sorted(result["by_truth"].items()):
        table.add_row(truth, str(stats["n"]), f"{stats['recall']:.4f}")
    console.print(table)
    console.print(f"\n[bold]overall accuracy (coarse):[/bold] {result['accuracy_coarse']:.4f}")


@main.command("list")
def list_cmd():
    bundles = load_bundles()
    for v in bundles:
        console.print(f"  • {v}")
    console.print(f"\n[dim]{len(bundles)} variants total[/dim]")
