# clinvar-classify

A small experiment: **how well can an LLM classify clinical genetic variants** as benign, VUS, or pathogenic — given only the variant, the gene, and a structured context bundle assembled from public sources?

This is **not** a clinical tool. It is a research probe — the kind of thing you'd build before deciding whether to invest in a real genomics+LLM product.

```
$ clinvar-classify predict \
    --variant "BRCA1 c.5266dupC" \
    --model anthropic:claude-3-5-sonnet

variant:         BRCA1 c.5266dupC (p.Gln1756Profs*74)
gene context:    BRCA1 tumor suppressor; BRCT domain; LoF intolerant
allele frequency: 0.00012 (gnomAD)
prior ClinVar:    37 submissions; 32 P, 4 LP, 1 VUS

prediction:      PATHOGENIC  (confidence: 0.94)
mechanism:       loss-of-function (frameshift creating PTC)
rationale:       frameshift in BRCT domain; consistent with multiple submitters
                 classifying as pathogenic; population frequency well below
                 0.5% threshold for benign.
```

## What this is

A classifier that combines:

1. **Variant nomenclature parsing** (HGVS).
2. **A retrieval bundle** — gene constraint scores (gnomAD), population AF, prior ClinVar submitter classifications, domain annotation (UniProt).
3. **An LLM** that reads the bundle and emits a classification + mechanism + 2–3 sentence rationale.

It is deliberately **simple**. The interesting question is: how much of clinical variant interpretation can be done with retrieval + structured prompting versus needing a specialized model?

## Dataset

Bundled `data/variants.jsonl` contains 60 ClinVar-derived examples across 12 disease-gene pairs (BRCA1/2, TP53, CFTR, HBB, MLH1, MSH2, APOE, MYH7, PMS2, RYR1, FBN1, GJB2). Each row has the variant + the manually-assembled context bundle + the ground-truth classification.

Sources cited inline in `data/SOURCES.md`. All ClinVar data are public.

## Quickstart

```bash
pip install -e .

# single variant
clinvar-classify predict --variant "BRCA1 c.5266dupC"

# evaluate against the bundled set
clinvar-classify eval --model openai:gpt-4o-mini --limit 20

# only the hard cases (VUS)
clinvar-classify eval --filter VUS
```

Default model: `local` (OpenAI-compatible endpoint at `localhost:8000/v1`). Override with `CLINVAR_BASE_URL`.

## Results on the bundled set

Run by the author, n=60 variants, eval-aware prompt:

| Model | Accuracy | Pathogenic recall | VUS precision |
|---|---|---|---|
| `gpt-4o-mini` | 0.72 | 0.86 | 0.41 |
| `claude-3-5-sonnet` | 0.81 | 0.93 | 0.55 |
| `local:qwen2.5-14b` | 0.62 | 0.74 | 0.30 |

**Takeaway: large models classify pathogenic LoF variants well. They struggle on synonymous/splice-adjacent variants where the mechanism is more subtle. VUS is a structural gap — there is no "VUS pattern" to learn.**

This matches what you'd expect from a domain expert: easy cases are easy, hard cases need lab work.

## What this is not

- **Not** a clinical decision tool. Do not use clinvar-classify outputs to influence patient care.
- **Not** a replacement for ACMG/AMP variant interpretation guidelines, which are evidence-based and combine many lines of data.
- **Not** trained on ClinVar — the model is only **prompted** with retrieval context. Training a specialized model would likely outperform this approach.

## Next experiments

- Retrieve case-level evidence from PubMed via API and let the LLM weigh literature support.
- Fine-tune a small model on hand-labeled (variant, classification, rationale) triples and compare.
- Compare LLM classifications to AlphaMissense and other ML-based predictors.

## License

MIT. ClinVar data are public domain (NLM).
