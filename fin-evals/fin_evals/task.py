"""Task abstraction and example loading."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class Example:
    input: str
    target: Any
    meta: dict = field(default_factory=dict)


class Task:
    name: str = ""
    dataset: str = ""

    def load(self) -> list[Example]:
        path = Path(__file__).parent.parent / self.dataset
        examples: list[Example] = []
        with path.open() as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                row = json.loads(line)
                examples.append(
                    Example(input=row["input"], target=row["target"], meta=row.get("meta", {}))
                )
        return examples

    def prompt(self, ex: Example) -> str:
        raise NotImplementedError

    def score(self, ex: Example, completion: str) -> dict[str, float]:
        raise NotImplementedError
