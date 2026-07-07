from .term_sheet import TermSheetTask
from .sec_10k_qa import Sec10KQATask
from .reg_compliance import RegComplianceTask
from .treasury_arithmetic import TreasuryArithmeticTask

REGISTRY = {
    t.name: t
    for t in [TermSheetTask, Sec10KQATask, RegComplianceTask, TreasuryArithmeticTask]
}


def get(name: str):
    if name not in REGISTRY:
        raise KeyError(f"unknown task {name!r}. Available: {sorted(REGISTRY)}")
    return REGISTRY[name]()
