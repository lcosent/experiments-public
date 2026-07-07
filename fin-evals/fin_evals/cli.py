"""fin-evals CLI."""

from __future__ import annotations

import json
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from fin_evals import runner, tasks
from fin_evals.models import ModelSpec


console = Console()


@click.group()
def main():
    """fin-evals: domain eval harness for LLMs on financial reasoning."""


@main.command("run")
@click.option("--task", "task_name", required=True, help="Task name (term_sheet, sec_10k_qa, ...)")
@click.option("--model", default="local", help="Model spec: local | openai:gpt-4o | anthropic:claude-...")
@click.option("--limit", type=int, default=None, help="Limit number of examples")
def run_cmd(task_name: str, model: str, limit: int | None):
    """Run a task against a model and print a scorecard."""
    task = tasks.get(task_name)
    spec = ModelSpec.parse(model)
    result = runner.run(task, spec, limit=limit)
    runner.save(result)

    table = Table(title=f"{result.task}  ·  {result.model}", show_lines=False)
    table.add_column("metric")
    table.add_column("score", justify="right")
    for k, v in result.aggregate.items():
        table.add_row(k, f"{v:.4f}")
    console.print(table)
    console.print(f"[dim]n={result.n}  total={result.seconds}s[/dim]")


@main.command("list")
def list_cmd():
    """List available tasks."""
    for name in sorted(tasks.REGISTRY):
        console.print(f"  • {name}")


@main.command("report")
@click.option("--runs-dir", default="runs", show_default=True)
def report_cmd(runs_dir: str):
    """Markdown table over the last 10 runs."""
    files = sorted(Path(runs_dir).glob("*.json"), reverse=True)[:10]
    if not files:
        console.print("[yellow]no runs found[/yellow]")
        return
    rows = []
    for f in files:
        data = json.loads(f.read_text())
        rows.append(
            (
                data["task"],
                data["model"],
                data["n"],
                {k: f"{v:.3f}" for k, v in data["aggregate"].items()},
            )
        )
    table = Table(title="last 10 runs")
    table.add_column("task")
    table.add_column("model")
    table.add_column("n", justify="right")
    table.add_column("scores")
    for task, model, n, scores in rows:
        table.add_row(task, model, str(n), str(scores))
    console.print(table)
