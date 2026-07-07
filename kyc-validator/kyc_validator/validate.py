"""Deterministic validation rules."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime

from .extract import ExtractedDoc


@dataclass
class Check:
    name: str
    ok: bool
    detail: str = ""


@dataclass
class ValidationReport:
    checks: list[Check] = field(default_factory=list)
    risk_score: float = 0.0
    verdict: str = "REVIEW"  # ACCEPT | REVIEW | REJECT

    def add(self, name: str, ok: bool, detail: str = ""):
        self.checks.append(Check(name=name, ok=ok, detail=detail))


def _parse_date(s: str | None) -> date | None:
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        return None


def validate_age(doc: ExtractedDoc, min_age: int = 18) -> Check:
    dob = _parse_date(doc.date_of_birth)
    if not dob:
        return Check("age", False, "no DOB extracted")
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return Check("age", age >= min_age, f"{age} years (min {min_age})")


def validate_expiry(doc: ExtractedDoc) -> Check:
    if doc.document_type in {"utility_bill", "tax_id"}:
        return Check("expiry", True, "n/a for this document type")
    exp = _parse_date(doc.expiry_date)
    if not exp:
        return Check("expiry", False, "no expiry date extracted")
    today = date.today()
    if exp < today:
        return Check("expiry", False, f"expired on {exp}")
    days = (exp - today).days
    return Check("expiry", True, f"valid, {days} days remaining")


def validate_mrz_checksum(doc: ExtractedDoc) -> Check:
    if doc.document_type != "passport" or not doc.raw_mrz:
        return Check("mrz_checksum", True, "n/a")
    if not _mrz_checksum_ok(doc.raw_mrz):
        return Check("mrz_checksum", False, "MRZ checksum mismatch")
    return Check("mrz_checksum", True, "MRZ checksum valid")


def _mrz_checksum_ok(mrz: str) -> bool:
    """Standard ICAO 9303 weighted checksum 7-3-1 over the document number field."""
    lines = [l for l in mrz.split("\n") if l]
    if len(lines) < 2 or len(lines[1]) < 10:
        return False
    line2 = lines[1]
    doc_number = line2[:9]
    expected = int(line2[9]) if line2[9].isdigit() else -1
    weights = [7, 3, 1]
    total = 0
    for i, ch in enumerate(doc_number):
        if ch == "<":
            v = 0
        elif ch.isdigit():
            v = int(ch)
        else:
            v = ord(ch.upper()) - 55
        total += v * weights[i % 3]
    return total % 10 == expected


def validate_utility_bill_recency(doc: ExtractedDoc, max_age_days: int = 90) -> Check:
    if doc.document_type != "utility_bill":
        return Check("utility_recency", True, "n/a")
    issued = _parse_date(doc.issue_date)
    if not issued:
        return Check("utility_recency", False, "no issue date extracted")
    age = (date.today() - issued).days
    return Check("utility_recency", age <= max_age_days, f"issued {age} days ago (max {max_age_days})")


def compute_risk(report: ValidationReport, doc: ExtractedDoc) -> float:
    score = 0.0
    for c in report.checks:
        if not c.ok:
            score += 25
    if doc.confidence < 0.7:
        score += 10
    if doc.document_type == "unknown":
        score += 30
    return min(score, 100.0)


def decide(report: ValidationReport, watchlist_hit: bool) -> str:
    if watchlist_hit:
        return "REVIEW"
    failed = [c for c in report.checks if not c.ok]
    if any(c.name in {"age", "expiry"} for c in failed):
        return "REJECT"
    if report.risk_score >= 50:
        return "REVIEW"
    return "ACCEPT"


def run_all(doc: ExtractedDoc, watchlist_hit: bool = False) -> ValidationReport:
    report = ValidationReport()
    for check_fn in [validate_age, validate_expiry, validate_mrz_checksum, validate_utility_bill_recency]:
        report.checks.append(check_fn(doc))
    report.risk_score = compute_risk(report, doc)
    report.verdict = decide(report, watchlist_hit)
    return report
