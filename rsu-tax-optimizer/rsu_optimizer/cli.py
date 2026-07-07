from __future__ import annotations

from datetime import date
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from . import profile as prof, simulate as sim, tax, vest as vsched


console = Console()


@click.group()
def main():
    """rsu-tax-optimizer: RSU vest simulator and sell-vs-hold optimizer."""


@main.command("next-vest")
@click.option("--profile", "profile_path", required=True)
def next_vest_cmd(profile_path: str):
    p = prof.load(Path(profile_path))
    upcoming = vsched.remaining(p.vests, date.today())
    if not upcoming:
        console.print("[yellow]no future vests on schedule[/yellow]")
        return
    v = upcoming[0]
    value = v.shares * p.current_price
    withheld = tax.supplemental_withholding(value)
    breakdown = tax.income_tax(
        wages=p.salary_w2_usd + value,
        capital_gains_lt=0,
        capital_gains_st=0,
        state=p.state,
        filing=p.filing_status,
    )
    baseline = tax.income_tax(p.salary_w2_usd, 0, 0, p.state, p.filing_status)
    actual_marginal = breakdown.total - baseline.total

    console.print(f"[bold]next vest:[/bold] {v.date}")
    console.print(f"shares:              {v.shares:,.2f}")
    console.print(f"value at $185:       ${value:,.2f}")
    console.print(f"employer withhold:   ${withheld:,.2f}  (supplemental rate)")
    console.print(f"actual marginal tax: ${actual_marginal:,.2f}  (federal+state+FICA+NIIT)")
    delta = actual_marginal - withheld
    if delta > 0:
        console.print(f"[red]shortfall:[/red] ${delta:,.2f}  — set aside or pay estimated tax.")
    else:
        console.print(f"[green]over-withheld:[/green] ${-delta:,.2f}")


@main.command("project-year")
@click.option("--profile", "profile_path", required=True)
def project_year_cmd(profile_path: str):
    p = prof.load(Path(profile_path))
    today = date.today()
    this_year_vests = [v for v in p.vests if v.date.year == today.year and v.date >= today]
    total_rsu_value = sum(v.shares * p.current_price for v in this_year_vests)

    breakdown = tax.income_tax(
        wages=p.salary_w2_usd + total_rsu_value, capital_gains_lt=0, capital_gains_st=0,
        state=p.state, filing=p.filing_status,
    )
    withheld = tax.supplemental_withholding(total_rsu_value)
    baseline = tax.income_tax(p.salary_w2_usd, 0, 0, p.state, p.filing_status)

    table = Table(title=f"projection {today.year}", show_lines=False)
    table.add_column("item")
    table.add_column("value", justify="right")
    table.add_row("salary (W-2)", f"${p.salary_w2_usd:,.0f}")
    table.add_row("RSU vests remaining this year", f"${total_rsu_value:,.0f}")
    table.add_row("federal income tax", f"${breakdown.federal:,.0f}")
    table.add_row(f"state ({p.state})", f"${breakdown.state:,.0f}")
    table.add_row("FICA + medicare + addl", f"${breakdown.fica_ss + breakdown.fica_medicare + breakdown.addl_medicare:,.0f}")
    table.add_row("NIIT", f"${breakdown.niit:,.0f}")
    table.add_row("[bold]total tax (full year)[/bold]", f"${breakdown.total:,.0f}")
    table.add_row("RSU supplemental withholding", f"${withheld:,.0f}")
    shortfall = (breakdown.total - baseline.total) - withheld
    color = "red" if shortfall > 0 else "green"
    table.add_row(f"[{color}]shortfall vs withholding[/{color}]", f"${shortfall:,.0f}")
    console.print(table)


@main.command("simulate")
@click.option("--profile", "profile_path", required=True)
@click.option("--runs", default=1000, show_default=True)
def simulate_cmd(profile_path: str, runs: int):
    p = prof.load(Path(profile_path))
    results = sim.simulate(p, runs=runs)
    table = Table(title=f"Monte Carlo · {runs} runs")
    table.add_column("strategy")
    table.add_column("median", justify="right")
    table.add_column("p25", justify="right")
    table.add_column("p75", justify="right")
    table.add_column("downside p90", justify="right")
    for r in results:
        table.add_row(
            r.name,
            f"${r.median:,.0f}",
            f"${r.p25:,.0f}",
            f"${r.p75:,.0f}",
            f"{r.downside_risk:.1%}",
        )
    console.print(table)
    if results:
        best = max(results, key=lambda r: r.median - 1.5 * r.downside_risk * abs(r.median))
        console.print(f"\n[bold]risk-adjusted best:[/bold] {best.name}")


@main.command("amt-check")
@click.option("--profile", "profile_path", required=True)
def amt_check_cmd(profile_path: str):
    p = prof.load(Path(profile_path))
    console.print(
        "RSUs are not AMT-preference items. AMT only matters if you also exercise ISOs and hold past year-end."
    )
    console.print("If you have ISOs, use a dedicated AMT calculator.")
