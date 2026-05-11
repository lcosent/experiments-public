"""LLM adapter."""

from __future__ import annotations

import os

from openai import OpenAI


def _client(spec: str) -> tuple[OpenAI, str]:
    if spec == "local" or spec.startswith("local:"):
        base = os.environ.get("CLINVAR_BASE_URL", "http://localhost:8000/v1")
        return OpenAI(base_url=base, api_key="local"), (
            "chat" if spec == "local" else spec.split(":", 1)[1]
        )
    if spec.startswith("openai:"):
        return OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "")), spec.split(":", 1)[1]
    if spec.startswith("anthropic:"):
        return (
            OpenAI(
                base_url="https://api.anthropic.com/v1",
                api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
            ),
            spec.split(":", 1)[1],
        )
    raise ValueError(f"unknown model spec: {spec}")


def complete(spec: str, prompt: str, max_tokens: int = 400) -> str:
    client, name = _client(spec)
    resp = client.chat.completions.create(
        model=name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.0,
    )
    return resp.choices[0].message.content or ""
