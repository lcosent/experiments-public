"""Vest schedule generator."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterator


@dataclass
class Vest:
    date: date
    shares: float
    cumulative_shares: float


def generate(
    total_shares: float,
    start_date: date,
    cliff_months: int = 12,
    total_months: int = 48,
    frequency: str = "monthly",
) -> list[Vest]:
    """Standard 4-year monthly vest with 1-year cliff by default."""
    if frequency == "monthly":
        period_months = 1
    elif frequency == "quarterly":
        period_months = 3
    elif frequency == "annual":
        period_months = 12
    else:
        raise ValueError(f"unknown frequency {frequency}")

    schedule: list[Vest] = []
    periods_after_cliff = (total_months - cliff_months) // period_months
    shares_at_cliff = total_shares * cliff_months / total_months
    shares_per_period = (total_shares - shares_at_cliff) / max(periods_after_cliff, 1)

    cumulative = 0.0
    cliff_date = _add_months(start_date, cliff_months)
    cumulative += shares_at_cliff
    schedule.append(Vest(date=cliff_date, shares=shares_at_cliff, cumulative_shares=cumulative))

    for i in range(1, periods_after_cliff + 1):
        d = _add_months(cliff_date, i * period_months)
        cumulative += shares_per_period
        schedule.append(Vest(date=d, shares=shares_per_period, cumulative_shares=round(cumulative, 4)))
    return schedule


def _add_months(d: date, n: int) -> date:
    month = d.month + n
    year = d.year + (month - 1) // 12
    month = (month - 1) % 12 + 1
    day = min(d.day, _last_day(year, month))
    return date(year, month, day)


def _last_day(y: int, m: int) -> int:
    if m == 2:
        leap = (y % 4 == 0 and y % 100 != 0) or y % 400 == 0
        return 29 if leap else 28
    return 30 if m in {4, 6, 9, 11} else 31


def remaining(vests: list[Vest], today: date) -> list[Vest]:
    return [v for v in vests if v.date >= today]
