# fin-evals

A small, opinionated **eval harness for LLMs on financial reasoning** — the kind of work that breaks public benchmarks but matters in production.

Public LLM benchmarks (MMLU, HellaSwag, even MMLU-Pro) score models on textbook reasoning. They tell you almost nothing about whether a model can read a real term sheet, answer a regulatory question without hallucinating, or extract clean numbers from a 10-K. **fin-evals** fills that gap with four narrow tasks scored by deterministic rules — no LLM-as-judge.

```
$ fin-evals run --task term_sheet --model local --limit 10

term_sheet  ·  local-qwen2.5-14b
────────────────────────────────────────
liquidation_pref   exact_match    9 / 10   0.90
participation      exact_match   10 / 10   1.00
anti_dilution      label_match    7 / 10   0.70
dividend_rate      numeric_±1bp   8 / 10   0.80
────────────────────────────────────────
weighted score:                            0.85
```

## Why this exists

Two convictions:

1. **Domain evals are how you compare models for real work.** Generic benchmarks correlate weakly with downstream performance in regulated/financial workflows. The gap between "scores 90% on MMLU" and "doesn't hallucinate a non-existent OCC bulletin" is enormous.
2. **Deterministic scoring beats LLM-as-judge for narrow tasks.** Where ground truth is a number, a label, or a regulated text, score it that way. Judge models hide their own biases.

This is not a leaderboard project. It is a **tool you fork and adapt** to your own institution's data.

## The four tasks

| Task | What it measures | Scoring |
|---|---|---|
| `term_sheet` | Extract 4 standard clauses from a synthetic term sheet | Exact match / label match / numeric tolerance |
| `sec_10k_qa` | Answer narrow questions from a real 10-K excerpt (footnotes, segment revenue, etc.) | Numeric tolerance + unit normalization |
| `reg_compliance` | Classify a customer disclosure as compliant / non-compliant against a stated rule | Label match + rationale-contains-clause |
| `treasury_arithmetic` | Compute yield, accrued interest, day-count conventions | Numeric exact at 6 decimal places |

Each task ships with a small (5–20 item) seed dataset under `evals/`. Replace with your own JSONL — the harness doesn't care.

## Quickstart

```bash
pip install -e .
fin-evals run --task term_sheet --model local --limit 5
fin-evals run --task sec_10k_qa --model openai:gpt-4o-mini
fin-evals report  # markdown table across last 10 runs
```

The default `--model local` calls an OpenAI-compatible endpoint at `http://localhost:8000/v1`. Override with `FIN_EVALS_BASE_URL` and `FIN_EVALS_API_KEY`. Cloud adapters for OpenAI and Anthropic are one-line shims.

## Adding a task

```python
# fin_evals/tasks/my_task.py
from fin_evals.task import Task, Example

class MyTask(Task):
    name = "my_task"
    dataset = "evals/my_task.jsonl"

    def prompt(self, ex: Example) -> str:
        return f"Question: {ex.input}\nAnswer:"

    def score(self, ex: Example, completion: str) -> dict:
        return {"exact_match": 1.0 if completion.strip() == ex.target else 0.0}
```

Register the class, drop a JSONL alongside it, and `fin-evals run --task my_task` picks it up.

## What this is not

- Not a leaderboard. Different models on the same seed data will land different absolute scores; what matters is the **delta** when you change a prompt, a model, or a fine-tune.
- Not an LLM-as-judge framework. Use [Inspect](https://github.com/UKGovernmentBEIS/inspect_ai) or [promptfoo](https://github.com/promptfoo/promptfoo) for that. The two coexist.
- Not a benchmark for "AI safety." Narrow capability evals only.

## License

MIT. Use it, fork it, send PRs with better tasks.
