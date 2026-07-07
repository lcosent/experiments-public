from .variant_pathogenicity import VariantPathogenicityTask
from .pathway_reasoning import PathwayReasoningTask
from .dose_response import DoseResponseTask
from .paper_claims import PaperClaimsTask
from .unit_arithmetic import UnitArithmeticTask

REGISTRY = {
    t.name: t
    for t in [
        VariantPathogenicityTask,
        PathwayReasoningTask,
        DoseResponseTask,
        PaperClaimsTask,
        UnitArithmeticTask,
    ]
}


def get(name: str):
    if name not in REGISTRY:
        raise KeyError(f"unknown task {name!r}. Available: {sorted(REGISTRY)}")
    return REGISTRY[name]()
