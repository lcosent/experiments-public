from __future__ import annotations

from fin_evals.task import Example, Task
from fin_evals.scoring import exact_match, label_match, numeric_within


PROMPT = """You are reviewing a venture capital term sheet. Extract the value for the requested clause.
Reply with the value only — no extra text, no explanation.

Term sheet excerpt:
{body}

Clause: {clause}
Value:"""


class TermSheetTask(Task):
    name = "term_sheet"
    dataset = "evals/term_sheet.jsonl"

    def prompt(self, ex: Example) -> str:
        return PROMPT.format(body=ex.input, clause=ex.meta["clause"])

    def score(self, ex: Example, completion: str) -> dict[str, float]:
        scorer = ex.meta.get("scorer", "exact_match")
        if scorer == "exact_match":
            return {"exact_match": exact_match(completion, ex.target)}
        if scorer == "label_match":
            return {"label_match": label_match(completion, ex.meta["labels"])}
        if scorer == "numeric_within":
            return {
                "numeric_within": numeric_within(
                    completion, float(ex.target), float(ex.meta.get("tol", 0.01))
                )
            }
        return {"exact_match": exact_match(completion, ex.target)}
