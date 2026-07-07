"""Load a YAML profile into runtime objects."""

from __future__ import annotations

from datetime import date, datetime
from pathlib import Path

import yaml

from .simulate import Profile
from .vest import generate


def load(path: Path) -> Profile:
    data = yaml.safe_load(path.read_text())
    vs = data["vest_schedule"]
    start = vs["start_date"]
    if isinstance(start, str):
        start = datetime.strptime(start, "%Y-%m-%d").date()
    vests = generate(
        total_shares=vs["total_shares"],
        start_date=start,
        cliff_months=vs.get("cliff_months", 12),
        total_months=vs.get("total_months", 48),
        frequency=vs.get("frequency", "monthly"),
    )
    stock = data["stock"]
    return Profile(
        filing_status=data["filing_status"],
        state=data["state"],
        salary_w2_usd=float(data["salary_w2_usd"]),
        vests=vests,
        current_price=float(stock["current_price_usd"]),
        drift_annual=float(stock.get("expected_drift_annual", 0.08)),
        vol_annual=float(stock.get("expected_vol_annual", 0.35)),
    )
