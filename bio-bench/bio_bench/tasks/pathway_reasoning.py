from bio_bench.core import Example, Task, label_match


PROMPT = """Pathway reasoning.

Pathway context: {context}
Perturbation: {perturbation}

What is the most likely effect on the indicated downstream node?
Choose one: INCREASE, DECREASE, NO_CHANGE.
Answer (single word):"""


class PathwayReasoningTask(Task):
    name = "pathway_reasoning"
    dataset = "evals/pathway_reasoning.jsonl"

    def prompt(self, ex):
        return PROMPT.format(
            context=ex.meta["context"], perturbation=ex.input
        )

    def score(self, ex: Example, completion: str):
        return {"label_match": label_match(completion, [ex.target])}
