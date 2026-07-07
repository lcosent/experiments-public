"""Model adapters. OpenAI-compatible by default."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class ModelSpec:
    provider: str
    name: str

    @classmethod
    def parse(cls, spec: str) -> "ModelSpec":
        if spec == "local":
            return cls(provider="local", name=os.environ.get("FIN_EVALS_MODEL", "chat"))
        if ":" in spec:
            provider, name = spec.split(":", 1)
            return cls(provider=provider, name=name)
        return cls(provider="openai", name=spec)


def base_url_for(spec: ModelSpec) -> str:
    if spec.provider == "local":
        return os.environ.get("FIN_EVALS_BASE_URL", "http://localhost:8000/v1")
    if spec.provider == "openai":
        return "https://api.openai.com/v1"
    if spec.provider == "anthropic":
        return "https://api.anthropic.com/v1"
    raise ValueError(f"unknown provider: {spec.provider}")


def api_key_for(spec: ModelSpec) -> str:
    if spec.provider == "local":
        return "local"
    if spec.provider == "openai":
        return os.environ.get("OPENAI_API_KEY", "")
    if spec.provider == "anthropic":
        return os.environ.get("ANTHROPIC_API_KEY", "")
    return ""


def complete(spec: ModelSpec, prompt: str, max_tokens: int = 256) -> str:
    from openai import OpenAI

    client = OpenAI(base_url=base_url_for(spec), api_key=api_key_for(spec))
    resp = client.chat.completions.create(
        model=spec.name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.0,
    )
    return resp.choices[0].message.content or ""
