from bio_bench.core import Example, Task, label_match


PROMPT = """Read the abstract and classify the claim.

Abstract:
{abstract}

Claim: {claim}

Answer with one of: SUPPORTED, CONTRADICTED, UNMENTIONED.
Answer:"""


class PaperClaimsTask(Task):
    name = "paper_claims"
    dataset = "evals/paper_claims.jsonl"

    def prompt(self, ex):
        return PROMPT.format(abstract=ex.input, claim=ex.meta["claim"])

    def score(self, ex: Example, completion: str):
        return {"label_match": label_match(completion, [ex.target])}
