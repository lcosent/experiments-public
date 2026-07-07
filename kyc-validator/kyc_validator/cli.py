from __future__ import annotations

import json
from pathlib import Path

import click
from rich.console import Console

from .extract import extract
from .validate import run_all
from .watchlist import check as watchlist_check


console = Console()


@click.group()
def main():
    """kyc-validator: local-only KYC document validator."""


@main.command("check")
@click.argument("path")
def check_cmd(path: str):
    text = Path(path).read_text(errors="ignore")
    doc = extract(text)
    hits = watchlist_check(doc.full_name)
    report = run_all(doc, watchlist_hit=bool(hits))

    console.print(f"[bold]document type[/bold]   {doc.document_type}  (conf {doc.confidence:.2f})")
    console.print(f"country         {doc.country}")
    console.print(f"holder name     {doc.full_name}")
    console.print(f"date of birth   {doc.date_of_birth}")
    console.print(f"document number {doc.document_number}")
    console.print(f"expiry date     {doc.expiry_date}")
    console.print()
    for c in report.checks:
        marker = "[green]✓[/green]" if c.ok else "[red]✗[/red]"
        console.print(f"  {marker} {c.name:20s} {c.detail}")
    console.print()
    if hits:
        console.print(f"[yellow]watchlist:[/yellow] {len(hits)} hit(s)")
        for h in hits:
            console.print(f"  • {h.list_name}: {h.matched_name} (score {h.score:.0f})")
    else:
        console.print("watchlist:      [green]PASS[/green]")
    console.print()
    console.print(f"[bold]risk score:[/bold] {report.risk_score:.1f} / 100")
    color = {"ACCEPT": "green", "REVIEW": "yellow", "REJECT": "red"}[report.verdict]
    console.print(f"[bold]verdict:[/bold] [{color}]{report.verdict}[/{color}]")


@main.command("batch")
@click.argument("folder")
@click.option("--out", default="reports", show_default=True)
def batch_cmd(folder: str, out: str):
    src = Path(folder)
    dst = Path(out)
    dst.mkdir(parents=True, exist_ok=True)
    summary = []
    for fp in sorted(src.iterdir()):
        if not fp.is_file():
            continue
        text = fp.read_text(errors="ignore")
        doc = extract(text)
        hits = watchlist_check(doc.full_name)
        report = run_all(doc, watchlist_hit=bool(hits))
        out_file = dst / f"{fp.stem}.json"
        out_file.write_text(
            json.dumps(
                {
                    "file": fp.name,
                    "doc": doc.__dict__,
                    "checks": [c.__dict__ for c in report.checks],
                    "risk_score": report.risk_score,
                    "watchlist_hits": [h.__dict__ for h in hits],
                    "verdict": report.verdict,
                },
                indent=2,
            )
        )
        summary.append((fp.name, report.verdict, report.risk_score))
        console.print(f"{report.verdict:8s}  risk={report.risk_score:5.1f}  {fp.name}")
    console.print(f"\n[green]wrote[/green] {len(summary)} reports to {dst}")


@main.command("update-lists")
def update_lists_cmd():
    """Placeholder: fetches OFAC SDN and EU sanctions CSVs into ./watchlists/.
    The real implementation downloads:
      - OFAC SDN  https://www.treasury.gov/ofac/downloads/sdn.csv
      - EU consolidated https://webgate.ec.europa.eu/fsd/fsf/public/files/csvFullSanctionsList_1_1/content
    Wire your favorite HTTP client; we keep this stub to avoid surprising network calls.
    """
    console.print("[yellow]update-lists is a stub.[/yellow] See docstring for source URLs.")
    console.print("Drop CSVs into ./watchlists/<name>.csv, one full-name column.")
