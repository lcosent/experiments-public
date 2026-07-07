"""Single-variant prediction: bundle + prompt + parse."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from .model import complete


PROMPT = """You are a clinical variant scientist. Classify the variant below using the structured context bundle.

VARIANT
  {variant}

GENE CONTEXT
  {gene_context}

POPULATION FREQUENCY
  {pop_af}

PRIOR CLINVAR SUBMISSIONS
  {clinvar_summary}

DOMAIN / FUNCTIONAL ANNOTATION
  {domain}

TASK
  1. Classify as one of: BENIGN, LIKELY_BENIGN, VUS, LIKELY_PATHOGENIC, PATHOGENIC.
  2. State the most likely mechanism (loss-of-function, gain-of-function,
     dominant-negative, splice disruption, synonymous, benign).
  3. Confidence score from 0.0 to 1.0.
  4. 2-3 sentence rationale grounded in the bundle.

Reply ONLY in this JSON format:
{{
  "classification": "...",
  "mechanism": "...",
  "confidence": 0.0,
  "rationale": "..."
}}"""


@dataclass
class Bundle:
    variant: str
    gene_context: str
    pop_af: str
    clinvar_summary: str
    domain: str


@dataclass
class Prediction:
    classification: str
    mechanism: str
    confidence: float
    rationale: str


def load_bundles(path: Path | None = None) -> dict[str, Bundle]:
    if path is None:
        path = Path(__file__).parent.parent / "data" / "variants.jsonl"
    bundles: dict[str, Bundle] = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        row = json.loads(line)
        b = row["bundle"]
        bundles[row["variant"]] = Bundle(
            variant=row["variant"],
            gene_context=b["gene_context"],
            pop_af=b["pop_af"],
            clinvar_summary=b["clinvar_summary"],
            domain=b["domain"],
        )
    return bundles


def predict(bundle: Bundle, model: str) -> Prediction:
    prompt = PROMPT.format(
        variant=bundle.variant,
        gene_context=bundle.gene_context,
        pop_af=bundle.pop_af,
        clinvar_summary=bundle.clinvar_summary,
        domain=bundle.domain,
    )
    raw = complete(model, prompt)
    return _parse(raw)


def _parse(raw: str) -> Prediction:
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return Prediction("UNKNOWN", "unknown", 0.0, raw.strip()[:300])
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        return Prediction("UNKNOWN", "unknown", 0.0, raw.strip()[:300])
    return Prediction(
        classification=str(data.get("classification", "UNKNOWN")).upper(),
        mechanism=str(data.get("mechanism", "")),
        confidence=float(data.get("confidence", 0.0)),
        rationale=str(data.get("rationale", "")),
    )
