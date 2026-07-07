from __future__ import annotations

from fin_evals.task import Example, Task
from fin_evals.scoring import numeric_within


PROMPT = """Fixed-income calculation. Compute the requested quantity and return ONLY the numeric answer
rounded to 6 decimal places. No units, no explanation.

Setup:
{body}

Compute: {target}
Answer:"""


class TreasuryArithmeticTask(Task):
    name = "treasury_arithmetic"
    dataset = "evals/treasury_arithmetic.jsonl"

    def prompt(self, ex: Example) -> str:
        return PROMPT.format(body=ex.input, target=ex.meta["target"])

    def score(self, ex: Example, completion: str) -> dict[str, float]:
        tol = float(ex.meta.get("tol", 1e-6))
        return {"numeric_within": numeric_within(completion, float(ex.target), tol)}
