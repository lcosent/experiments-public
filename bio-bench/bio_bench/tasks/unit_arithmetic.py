from bio_bench.core import Example, Task, numeric_within


PROMPT = """Lab math. Solve and return only a single number in the requested unit.

Problem: {problem}

Target unit: {unit}
Answer:"""


class UnitArithmeticTask(Task):
    name = "unit_arithmetic"
    dataset = "evals/unit_arithmetic.jsonl"

    def prompt(self, ex):
        return PROMPT.format(problem=ex.input, unit=ex.meta["unit"])

    def score(self, ex: Example, completion: str):
        return {
            "numeric_within": numeric_within(
                completion, float(ex.target), float(ex.meta.get("tol", 0.01))
            )
        }
