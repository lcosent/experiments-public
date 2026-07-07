from bio_bench.core import Example, Task, numeric_within


PROMPT = """Pharmacology dose-response.

EC50 = {ec50} nM, Hill slope n = {hill}, Emax = {emax}.
Compute the response (as a fraction of Emax, 0.0 to 1.0) at concentration {conc} nM.

Use the Hill equation: response/Emax = [L]^n / (EC50^n + [L]^n).
Answer (decimal, 4 places):"""


class DoseResponseTask(Task):
    name = "dose_response"
    dataset = "evals/dose_response.jsonl"

    def prompt(self, ex):
        m = ex.meta
        return PROMPT.format(ec50=m["ec50"], hill=m["hill"], emax=m["emax"], conc=m["conc"])

    def score(self, ex: Example, completion: str):
        return {"numeric_within": numeric_within(completion, float(ex.target), 0.01)}
