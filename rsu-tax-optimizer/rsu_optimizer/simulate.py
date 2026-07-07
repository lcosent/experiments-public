"""Monte Carlo simulation of sell-vs-hold strategies."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

import numpy as np

from .tax import income_tax
from .vest import Vest, remaining


@dataclass
class Profile:
    filing_status: str
    state: str
    salary_w2_usd: float
    vests: list[Vest]
    current_price: float
    drift_annual: float
    vol_annual: float


@dataclass
class StrategyResult:
    name: str
    after_tax_usd: list[float]

    @property
    def median(self) -> float:
        return float(np.median(self.after_tax_usd))

    @property
    def p25(self) -> float:
        return float(np.percentile(self.after_tax_usd, 25))

    @property
    def p75(self) -> float:
        return float(np.percentile(self.after_tax_usd, 75))

    @property
    def downside_risk(self) -> float:
        median = self.median
        drawdowns = [(median - v) / median for v in self.after_tax_usd if v < median]
        if not drawdowns:
            return 0.0
        return float(np.percentile(drawdowns, 90))


def _gbm_path(start: float, mu: float, sigma: float, years: float, rng: np.random.Generator) -> np.ndarray:
    steps = max(int(years * 252), 1)
    dt = years / steps
    z = rng.standard_normal(steps)
    increments = (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * z
    log_path = np.cumsum(increments)
    return start * np.exp(log_path)


def simulate(profile: Profile, runs: int = 1000, today: date | None = None) -> list[StrategyResult]:
    today = today or date.today()
    future_vests = remaining(profile.vests, today)
    if not future_vests:
        return []

    horizon_years = (future_vests[-1].date - today).days / 365.25
    rng = np.random.default_rng(seed=42)

    sell_immediately = []
    hold_one_year = []
    hold_to_vest_end = []

    for _ in range(runs):
        path = _gbm_path(profile.current_price, profile.drift_annual, profile.vol_annual, max(horizon_years + 1, 1.5), rng)
        steps_per_year = max(int(252 * (max(horizon_years + 1, 1.5)) / len(path)) or 1, 1)

        # SELL IMMEDIATELY: sell at vest, pay ordinary on FMV, no capital gain.
        total_after_tax = 0.0
        annual_rsu_income = 0.0
        for v in future_vests:
            day_index = min(int((v.date - today).days * 252 / 365.25), len(path) - 1)
            price = path[day_index]
            value = price * v.shares
            annual_rsu_income += value
        breakdown = income_tax(
            wages=profile.salary_w2_usd + annual_rsu_income,
            capital_gains_lt=0.0,
            capital_gains_st=0.0,
            state=profile.state,
            filing=profile.filing_status,
        )
        # subtract pre-RSU baseline tax to isolate RSU portion
        baseline = income_tax(profile.salary_w2_usd, 0, 0, profile.state, profile.filing_status)
        rsu_tax = breakdown.total - baseline.total
        total_after_tax = annual_rsu_income - rsu_tax
        sell_immediately.append(total_after_tax)

        # HOLD ONE YEAR: sell at vest+1y at then-current price, LTCG on appreciation.
        total_after_tax = 0.0
        for v in future_vests:
            day_index_vest = min(int((v.date - today).days * 252 / 365.25), len(path) - 1)
            day_index_sale = min(day_index_vest + 252, len(path) - 1)
            price_vest = path[day_index_vest]
            price_sale = path[day_index_sale]
            ordinary_value = price_vest * v.shares
            gain = (price_sale - price_vest) * v.shares
            ord_tax = supplemental_estimate(ordinary_value, profile)
            ltcg_tax = max(gain, 0) * 0.20 + max(gain, 0) * 0.038  # LTCG + NIIT, simplification
            total_after_tax += price_sale * v.shares - ord_tax - max(ltcg_tax, 0)
        hold_one_year.append(total_after_tax)

        # HOLD TO VEST END: keep until last vest date, sell everything at terminal price.
        terminal_price = path[-1]
        total_after_tax = 0.0
        for v in future_vests:
            day_index_vest = min(int((v.date - today).days * 252 / 365.25), len(path) - 1)
            price_vest = path[day_index_vest]
            ordinary_value = price_vest * v.shares
            ord_tax = supplemental_estimate(ordinary_value, profile)
            gain = (terminal_price - price_vest) * v.shares
            ltcg_tax = max(gain, 0) * 0.20 + max(gain, 0) * 0.038
            total_after_tax += terminal_price * v.shares - ord_tax - max(ltcg_tax, 0)
        hold_to_vest_end.append(total_after_tax)

    return [
        StrategyResult("sell_immediately", sell_immediately),
        StrategyResult("hold_one_year", hold_one_year),
        StrategyResult("hold_to_vest_end", hold_to_vest_end),
    ]


def supplemental_estimate(rsu_value: float, profile: Profile) -> float:
    """Marginal tax rate estimate for an extra dollar of RSU income."""
    base = income_tax(profile.salary_w2_usd, 0, 0, profile.state, profile.filing_status).total
    plus = income_tax(profile.salary_w2_usd + rsu_value, 0, 0, profile.state, profile.filing_status).total
    return plus - base
