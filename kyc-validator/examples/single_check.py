"""Run kyc-validator on a synthetic passport."""

from pathlib import Path

from kyc_validator.extract import extract
from kyc_validator.validate import run_all
from kyc_validator.watchlist import check as watchlist_check


def main():
    text = Path("test_documents/passport_synthetic.txt").read_text()
    doc = extract(text)
    hits = watchlist_check(doc.full_name)
    report = run_all(doc, watchlist_hit=bool(hits))

    print(doc)
    for c in report.checks:
        print(f"  {'OK' if c.ok else 'FAIL'}  {c.name}  {c.detail}")
    print(f"verdict: {report.verdict}  risk: {report.risk_score:.1f}")


if __name__ == "__main__":
    main()
