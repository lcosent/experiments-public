# bio-bench

A narrow, **honest** eval harness for LLMs on biological reasoning. Five task families. Deterministic scoring where ground truth is a label or a number. Public data, public answers, no leaderboard chasing.

The premise: existing biomedical benchmarks (MedQA, PubMedQA, MedMCQA) test memorization more than reasoning. Strong models can score >90% by pattern-matching exam style. **bio-bench** keeps each task small, mechanism-grounded, and trivially adversarial — wrong answers are plausible-sounding distractors drawn from adjacent biology.

```
$ bio-bench run --task variant_pathogenicity --model anthropic:claude-3-5-sonnet

variant_pathogenicity  ·  anthropic:claude-3-5-sonnet
──────────────────────────────────────────────────────
label_match            16 / 20    0.80
mechanism_quote         9 / 20    0.45
──────────────────────────────────────────────────────
notes: model classifies missense well; struggles on synonymous variants
       that disrupt splice sites.
```

## Why this exists

I am not a wet-lab biologist. I am someone who thinks frontier AI in biology is the most important research frontier of the next decade — and I wanted an eval surface I could **read end-to-end in an afternoon**, run against any model, and trust the numbers from. Existing harnesses (BigBio, MedHELM) are excellent and intimidating; bio-bench is the small one you'd actually fork.

If you build LLM tools for clinicians, drug discovery, or genomics, this is the kind of probe you want next to your domain dataset.

## Task families

| Task | What it measures | n | Source |
|---|---|---|---|
| `variant_pathogenicity` | Classify ClinVar-style variants as benign / VUS / pathogenic given the variant + gene context | 20 | Public ClinVar excerpts |
| `pathway_reasoning` | Predict the effect of a perturbation on a canonical pathway (e.g., MAPK, p53) | 15 | Hand-curated |
| `dose_response` | Given an EC50 / Hill slope, predict the response at a new concentration | 12 | Synthetic |
| `paper_claims` | Decide whether a claim is supported, contradicted, or unmentioned by the abstract | 18 | Open-access PubMed |
| `unit_arithmetic` | Convert between molarity, mass, IU, and dilution series — the part LLMs quietly fail at | 15 | Hand-curated |

Total: 80 examples. Tiny on purpose. Run a full sweep in under a minute.

## Quickstart

```bash
pip install -e .
bio-bench list
bio-bench run --task variant_pathogenicity --model local
bio-bench run --task all --model openai:gpt-4o-mini --limit 5
bio-bench report
```

Default `--model local` hits an OpenAI-compatible endpoint at `http://localhost:8000/v1`. Override with `BIO_BENCH_BASE_URL`.

## Scoring philosophy

| Where ground truth is... | We score with... |
|---|---|
| A label (`benign` / `VUS` / `pathogenic`) | Label match against a small synonym list |
| A number with units | Numeric tolerance after unit normalization |
| A mechanism | Substring match on a required clause ("loss-of-function", "splice donor") — strict, but transparent |

No LLM-as-judge. The scoring function for each task is 5–15 lines of Python.

## What this is not

- Not a clinical decision tool. Do not use bio-bench outputs to treat patients.
- Not a replacement for [BigBio](https://github.com/bigscience-workshop/biomedical) or [MedHELM](https://crfm.stanford.edu/helm/medhelm/latest/). It is a small, fast, adversarial probe — complementary, not competitive.
- Not exhaustive. Five task families cover maybe 5% of what matters in computational biology. PRs to expand welcome.

## Acknowledgments

Task design borrows from the Arc Institute's emphasis on **mechanism-grounded benchmarks**, and from AI2's [SciBench](https://github.com/mandyyyyii/scibench) on the importance of small, defensible eval sets.

## License

MIT.
