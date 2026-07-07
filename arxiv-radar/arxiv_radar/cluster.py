"""Cluster paper embeddings into themes."""

from __future__ import annotations

import os
from dataclasses import dataclass

import numpy as np
from sklearn.cluster import KMeans


@dataclass
class Cluster:
    label: int
    paper_indices: list[int]
    centroid: np.ndarray


def cluster(embeddings: np.ndarray, k: int | None = None) -> list[Cluster]:
    """Cluster with KMeans. KMeans is intentionally simple; swap for HDBSCAN if you prefer.
    Pick k as sqrt(n) bounded to [3, 20] when not specified.
    """
    if len(embeddings) == 0:
        return []
    if k is None:
        k = max(3, min(20, int(np.sqrt(len(embeddings)))))
    k = min(k, len(embeddings))
    seed = int(os.environ.get("ARXIV_RADAR_SEED", "42"))
    km = KMeans(n_clusters=k, random_state=seed, n_init=10)
    labels = km.fit_predict(embeddings)
    clusters: list[Cluster] = []
    for label in range(k):
        indices = [i for i, l in enumerate(labels) if l == label]
        if indices:
            clusters.append(
                Cluster(label=label, paper_indices=indices, centroid=km.cluster_centers_[label])
            )
    return clusters
