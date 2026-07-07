from __future__ import annotations

import json
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from bio_bench import core, tasks


console = Console()


@click.group()
def main():
    """bio-bench: narrow eval harness for LLMs on biological reasoning."""


@main.command("run")
@click.option("--task", "task_name", required=True)
@click.option("--model", default="local")
@click.option("--limit", type=int, default=None)
def run_cmd(task_name: str, model: str, limit: int | None):
    if task_name == "all":
        for name in sorted(tasks.REGISTRY):
            _run_one(name, model, limit)
    else:
        _run_one(task_name, model, limit)


def _run_one(task_name: str, model: str, limit: int | None):
    task = tasks.get(task_name)
    result = core.run(task, model, limit=limit)
    core.save(result)
    table = Table(title=f"{result.task}  ·  {result.model}")
    table.add_column("metric")
    table.add_column("score", justify="right")
    for k, v in result.aggregate.items():
        table.add_row(k, f"{v:.4f}")
    console.print(table)
    console.print(f"[dim]n={result.n}  total={result.seconds}s[/dim]\n")


@main.command("list")
def list_cmd():
    for name in sorted(tasks.REGISTRY):
        console.print(f"  • {name}")


@main.command("report")
@click.option("--runs-dir", default="runs")
def report_cmd(runs_dir: str):
    files = sorted(Path(runs_dir).glob("*.json"), reverse=True)[:10]
    if not files:
        console.print("[yellow]no runs found[/yellow]")
        return
    table = Table(title="last 10 runs")
    table.add_column("task")
    table.add_column("model")
    table.add_column("n", justify="right")
    table.add_column("scores")
    for f in files:
        data = json.loads(f.read_text())
        table.add_row(
            data["task"],
            data["model"],
            str(data["n"]),
            ", ".join(f"{k}={v:.3f}" for k, v in data["aggregate"].items()),
        )
    console.print(table)
