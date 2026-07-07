from __future__ import annotations

from fin_evals.task import Example, Task
from fin_evals.scoring import numeric_within


PROMPT = """You are a financial analyst. Answer the question using ONLY the 10-K excerpt below.
Reply with a single number in the unit requested. No commentary.

10-K excerpt:
{body}

Question: {question}
Answer:"""


class Sec10KQATask(Task):
    name = "sec_10k_qa"
    dataset = "evals/sec_10k_qa.jsonl"

    def prompt(self, ex: Example) -> str:
        return PROMPT.format(body=ex.input, question=ex.meta["question"])

    def score(self, ex: Example, completion: str) -> dict[str, float]:
        tol = float(ex.meta.get("tol", 0.01))
        return {
            "numeric_within": numeric_within(completion, float(ex.target), tol)
        }
