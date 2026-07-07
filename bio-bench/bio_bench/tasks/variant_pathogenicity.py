from bio_bench.core import Example, Task, contains, label_match


PROMPT = """You are a clinical variant scientist.

Variant: {variant}
Gene context: {gene_context}

Classify as one of: BENIGN, VUS, PATHOGENIC.
Then on a new line, explain the mechanism in one phrase (loss-of-function,
gain-of-function, dominant-negative, splice disruption, synonymous, etc.).

Classification:"""


class VariantPathogenicityTask(Task):
    name = "variant_pathogenicity"
    dataset = "evals/variant_pathogenicity.jsonl"

    def prompt(self, ex):
        return PROMPT.format(
            variant=ex.input, gene_context=ex.meta.get("gene_context", "")
        )

    def score(self, ex: Example, completion: str):
        return {
            "label_match": label_match(completion, [ex.target]),
            "mechanism_quote": contains(completion, ex.meta["expected_mechanism"]),
        }
