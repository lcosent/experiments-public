"""LLM-driven structured extraction from document text."""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass

from openai import OpenAI


EXTRACTION_PROMPT = """You extract structured KYC fields from document text.

The text below was OCR'd or provided directly. Identify the document type, then extract fields.
Reply ONLY with valid JSON. Use null for missing fields. Do not invent values.

Schema:
{{
  "document_type": "passport | national_id | drivers_license | utility_bill | tax_id | unknown",
  "country": "ISO-3 code or null",
  "full_name": "as printed",
  "date_of_birth": "YYYY-MM-DD or null",
  "document_number": "as printed",
  "expiry_date": "YYYY-MM-DD or null",
  "issue_date": "YYYY-MM-DD or null",
  "address": "single-line address for utility bill, else null",
  "confidence": 0.0,
  "raw_mrz": "for passports only, the two-line MRZ string, else null"
}}

Document text:
{text}

JSON:"""


@dataclass
class ExtractedDoc:
    document_type: str
    country: str | None
    full_name: str | None
    date_of_birth: str | None
    document_number: str | None
    expiry_date: str | None
    issue_date: str | None
    address: str | None
    confidence: float
    raw_mrz: str | None


def _local_client() -> tuple[OpenAI, str]:
    base = os.environ.get("KYC_BASE_URL", "http://localhost:8000/v1")
    model = os.environ.get("KYC_MODEL", "chat")
    return OpenAI(base_url=base, api_key="local"), model


def extract(text: str) -> ExtractedDoc:
    client, model = _local_client()
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": EXTRACTION_PROMPT.format(text=text[:6000])}],
        max_tokens=500,
        temperature=0.0,
    )
    raw = resp.choices[0].message.content or "{}"
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    payload = match.group(0) if match else "{}"
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        data = {}
    return ExtractedDoc(
        document_type=data.get("document_type", "unknown"),
        country=data.get("country"),
        full_name=data.get("full_name"),
        date_of_birth=data.get("date_of_birth"),
        document_number=data.get("document_number"),
        expiry_date=data.get("expiry_date"),
        issue_date=data.get("issue_date"),
        address=data.get("address"),
        confidence=float(data.get("confidence") or 0.0),
        raw_mrz=data.get("raw_mrz"),
    )
