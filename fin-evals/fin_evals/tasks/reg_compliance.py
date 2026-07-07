from __future__ import annotations

from fin_evals.task import Example, Task
from fin_evals.scoring import contains_clause, label_match


PROMPT = """You are a compliance reviewer. Classify the customer-facing disclosure as COMPLIANT or NON_COMPLIANT
against the stated rule. Then on a new line, quote the specific phrase that drove your decision.

Rule:
{rule}

Disclosure:
{body}

Classification:"""


class RegComplianceTask(Task):
    name = "reg_compliance"
    dataset = "evals/reg_compliance.jsonl"

    def prompt(self, ex: Example) -> str:
        return PROMPT.format(rule=ex.meta["rule"], body=ex.input)

    def score(self, ex: Example, completion: str) -> dict[str, float]:
        return {
            "label_match": label_match(completion, [ex.target]),
            "rationale_quote": contains_clause(completion, ex.meta["expected_quote"]),
        }
