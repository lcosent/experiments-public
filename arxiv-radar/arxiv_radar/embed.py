"""Embed paper abstracts via an OpenAI-compatible endpoint."""

from __future__ import annotations

import os

import numpy as np
from openai import OpenAI


def _client_and_model() -> tuple[OpenAI, str]:
    model_spec = os.environ.get("ARXIV_RADAR_EMBED_MODEL", "openai:text-embedding-3-small")
    if model_spec.startswith("local:"):
        base = os.environ.get("ARXIV_RADAR_BASE_URL", "http://localhost:8000/v1")
        api_key = "local"
        name = model_spec.split(":", 1)[1]
    elif model_spec.startswith("openai:"):
        base = "https://api.openai.com/v1"
        api_key = os.environ.get("OPENAI_API_KEY", "")
        name = model_spec.split(":", 1)[1]
    else:
        raise ValueError(f"unknown embed model spec: {model_spec}")
    return OpenAI(base_url=base, api_key=api_key), name


def embed(texts: list[str], batch: int = 64) -> np.ndarray:
    if not texts:
        return np.zeros((0, 1536), dtype=np.float32)
    client, model = _client_and_model()
    out: list[list[float]] = []
    for i in range(0, len(texts), batch):
        chunk = texts[i : i + batch]
        resp = client.embeddings.create(model=model, input=chunk)
        out.extend(d.embedding for d in resp.data)
    return np.array(out, dtype=np.float32)
