from __future__ import annotations

from datetime import datetime, date as dt_date
from pathlib import Path

import click
from rich.console import Console

from .digest import build_digest
from .fetch import default_window


console = Console()

BUNDLES = {
    "frontier_ai": ["cs.LG", "cs.AI", "cs.CL", "stat.ML"],
    "genomics": ["q-bio.GN", "q-bio.QM", "q-bio.MN"],
    "interpretability": ["cs.LG"],
    "robotics": ["cs.RO", "cs.AI"],
}


@click.group()
def main():
    """arxiv-radar: weekly frontier digest for arXiv."""


@main.command("weekly")
@click.option("--topic", "topics", multiple=True, help="arXiv category code (e.g. cs.LG)")
@click.option("--bundle", default=None, help="Saved bundle name: frontier_ai, genomics, ...")
@click.option("--since", default=None, help="YYYY-MM-DD")
@click.option("--until", default=None, help="YYYY-MM-DD")
@click.option("--k", default=None, type=int, help="Number of clusters (default sqrt(n))")
@click.option("--out", default=None, help="Path to write markdown digest")
def weekly_cmd(topics, bundle, since, until, k, out):
    if bundle:
        topics = tuple(BUNDLES[bundle])
    if not topics:
        raise click.UsageError("provide --topic ... or --bundle ...")

    if since and until:
        since_d = datetime.strptime(since, "%Y-%m-%d").date()
        until_d = datetime.strptime(until, "%Y-%m-%d").date()
    else:
        since_d, until_d = default_window(7)

    console.print(f"[dim]fetching {', '.join(topics)} from {since_d} to {until_d}...[/dim]")
    md = build_digest(list(topics), since_d, until_d, k=k)
    console.print(md)

    digests = Path("digests")
    digests.mkdir(exist_ok=True)
    target = Path(out) if out else digests / f"digest_{until_d:%Y%m%d}.md"
    target.write_text(md)
    console.print(f"\n[green]saved →[/green] {target}")


@main.command("history")
def history_cmd():
    digests = Path("digests")
    if not digests.exists():
        console.print("[yellow]no digests yet[/yellow]")
        return
    for f in sorted(digests.glob("*.md"), reverse=True):
        console.print(f"  • {f.name}")


@main.command("bundles")
def bundles_cmd():
    for name, cats in BUNDLES.items():
        console.print(f"  [bold]{name}[/bold]  ({', '.join(cats)})")
