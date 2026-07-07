"""Federal + state tax model. 2026 brackets (illustrative; confirm with CPA)."""

from __future__ import annotations

from dataclasses import dataclass


# 2026 federal brackets — illustrative
FEDERAL_BRACKETS_SINGLE = [
    (0, 0.10),
    (12_000, 0.12),
    (49_000, 0.22),
    (105_000, 0.24),
    (201_000, 0.32),
    (256_000, 0.35),
    (640_000, 0.37),
]
FEDERAL_BRACKETS_MFJ = [
    (0, 0.10),
    (24_000, 0.12),
    (98_000, 0.22),
    (211_000, 0.24),
    (403_000, 0.32),
    (513_000, 0.35),
    (770_000, 0.37),
]

STD_DEDUCTION = {"single": 15_000, "married_filing_jointly": 30_000}
SS_WAGE_BASE = 176_100
SS_RATE = 0.062
MEDICARE_RATE = 0.0145
ADDL_MEDICARE_THRESHOLD = {"single": 200_000, "married_filing_jointly": 250_000}
ADDL_MEDICARE_RATE = 0.009
NIIT_RATE = 0.038
NIIT_THRESHOLD = {"single": 200_000, "married_filing_jointly": 250_000}

SUPPLEMENTAL_LOW = 0.22
SUPPLEMENTAL_HIGH = 0.37
SUPPLEMENTAL_HIGH_THRESHOLD = 1_000_000


# State models — flat or single-bracket simplification
def state_tax(state: str, taxable: float, filing: str) -> float:
    state = state.upper()
    if state in {"WA", "TX", "FL", "TN", "NV"}:
        return 0.0
    if state == "CA":
        # simplified progressive
        bands = [
            (0, 0.01),
            (10_000, 0.02),
            (24_000, 0.04),
            (38_000, 0.06),
            (53_000, 0.08),
            (67_000, 0.093),
            (340_000, 0.103),
            (408_000, 0.113),
            (680_000, 0.123),
        ]
        return _apply_brackets(taxable, bands)
    if state == "NY":
        bands = [
            (0, 0.04),
            (8_500, 0.045),
            (11_700, 0.0525),
            (13_900, 0.055),
            (80_650, 0.06),
            (215_400, 0.0685),
            (1_077_550, 0.0965),
            (5_000_000, 0.103),
        ]
        return _apply_brackets(taxable, bands)
    return 0.0  # unmodeled: caller should treat as illustrative


def _apply_brackets(taxable: float, bands: list[tuple[float, float]]) -> float:
    tax = 0.0
    for i, (floor, rate) in enumerate(bands):
        ceiling = bands[i + 1][0] if i + 1 < len(bands) else float("inf")
        if taxable > floor:
            slice_amount = min(taxable, ceiling) - floor
            tax += slice_amount * rate
        else:
            break
    return round(tax, 2)


@dataclass
class TaxBreakdown:
    federal: float
    state: float
    fica_ss: float
    fica_medicare: float
    addl_medicare: float
    niit: float
    total: float


def income_tax(
    wages: float, capital_gains_lt: float, capital_gains_st: float, state: str, filing: str
) -> TaxBreakdown:
    brackets = FEDERAL_BRACKETS_MFJ if filing == "married_filing_jointly" else FEDERAL_BRACKETS_SINGLE
    std = STD_DEDUCTION[filing]

    ordinary_income = wages + capital_gains_st
    taxable_ord = max(0.0, ordinary_income - std)
    federal_ord = _apply_brackets(taxable_ord, brackets)

    # LTCG simplified at 15% / 20% threshold
    ltcg_top_threshold = 535_000 if filing == "married_filing_jointly" else 480_000
    if capital_gains_lt + taxable_ord <= ltcg_top_threshold:
        federal_ltcg = capital_gains_lt * 0.15
    else:
        federal_ltcg = capital_gains_lt * 0.20

    fed_total = federal_ord + federal_ltcg

    ss = min(wages, SS_WAGE_BASE) * SS_RATE
    medicare = wages * MEDICARE_RATE
    addl_med_taxable = max(0.0, wages - ADDL_MEDICARE_THRESHOLD[filing])
    addl_med = addl_med_taxable * ADDL_MEDICARE_RATE

    niit_taxable = max(0.0, (wages + capital_gains_lt + capital_gains_st) - NIIT_THRESHOLD[filing])
    niit = min(niit_taxable, capital_gains_lt + capital_gains_st) * NIIT_RATE

    state_tax_value = state_tax(state, taxable_ord, filing) + state_tax(
        state, capital_gains_lt + capital_gains_st, filing
    )

    total = fed_total + state_tax_value + ss + medicare + addl_med + niit
    return TaxBreakdown(
        federal=round(fed_total, 2),
        state=round(state_tax_value, 2),
        fica_ss=round(ss, 2),
        fica_medicare=round(medicare, 2),
        addl_medicare=round(addl_med, 2),
        niit=round(niit, 2),
        total=round(total, 2),
    )


def supplemental_withholding(rsu_income: float) -> float:
    if rsu_income <= SUPPLEMENTAL_HIGH_THRESHOLD:
        return rsu_income * SUPPLEMENTAL_LOW
    return (
        SUPPLEMENTAL_HIGH_THRESHOLD * SUPPLEMENTAL_LOW
        + (rsu_income - SUPPLEMENTAL_HIGH_THRESHOLD) * SUPPLEMENTAL_HIGH
    )
