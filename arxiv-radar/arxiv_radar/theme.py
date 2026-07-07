"""Ask an LLM to name a theme given representative papers."""

from __future__ import annotations

import os

from openai import OpenAI


PROMPT = """You are summarizing arXiv research clusters for a weekly digest.
Given 5 representative paper titles + abstracts below, return:
1. A short noun-phrase theme name (5-10 words). No filler.
2. A single sentence describing what unites them.

Format your response exactly as:
THEME: <theme name>
NOTE: <one sentence>

Papers:
{papers}
"""


def _client_and_model() -> tuple[OpenAI, str]:
    spec = os.environ.get("ARXIV_RADAR_LLM_MODEL", "openai:gpt-4o-mini")
    if spec.startswith("local:"):
        base = os.environ.get("ARXIV_RADAR_BASE_URL", "http://localhost:8000/v1")
        return OpenAI(base_url=base, api_key="local"), spec.split(":", 1)[1]
    if spec.startswith("openai:"):
        return OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "")), spec.split(":", 1)[1]
    raise ValueError(f"unknown llm model spec: {spec}")


def name_theme(representatives: list[tuple[str, str]]) -> tuple[str, str]:
    """representatives is a list of (title, abstract) pairs."""
    if not representatives:
        return "unknown", "no papers"
    body = "\n\n".join(
        f"- {title}\n  {abstract[:400]}" for title, abstract in representatives[:5]
    )
    client, model = _client_and_model()
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": PROMPT.format(papers=body)}],
        max_tokens=200,
        temperature=0.2,
    )
    text = resp.choices[0].message.content or ""
    theme, note = "unknown", ""
    for line in text.splitlines():
        if line.startswith("THEME:"):
            theme = line.split(":", 1)[1].strip()
        elif line.startswith("NOTE:"):
            note = line.split(":", 1)[1].strip()
    return theme, note
