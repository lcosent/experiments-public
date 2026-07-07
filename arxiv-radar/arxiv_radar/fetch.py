"""Fetch papers from the public arXiv API."""

from __future__ import annotations

import time
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from urllib.parse import urlencode

import feedparser


ARXIV_API = "http://export.arxiv.org/api/query"


@dataclass
class Paper:
    arxiv_id: str
    title: str
    abstract: str
    categories: list[str]
    published: date
    authors: list[str]
    url: str


def fetch(topics: list[str], since: date, until: date, max_results: int = 500) -> list[Paper]:
    cat_query = " OR ".join(f"cat:{c}" for c in topics)
    date_query = f"submittedDate:[{since:%Y%m%d}0000 TO {until:%Y%m%d}2359]"
    query = f"({cat_query}) AND {date_query}"

    params = {
        "search_query": query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    url = f"{ARXIV_API}?{urlencode(params)}"
    feed = feedparser.parse(url)

    papers: list[Paper] = []
    for entry in feed.entries:
        arxiv_id = entry.id.rsplit("/", 1)[-1].split("v")[0]
        published = datetime.strptime(entry.published[:10], "%Y-%m-%d").date()
        categories = [t.term for t in getattr(entry, "tags", []) if hasattr(t, "term")]
        papers.append(
            Paper(
                arxiv_id=arxiv_id,
                title=entry.title.replace("\n", " ").strip(),
                abstract=entry.summary.replace("\n", " ").strip(),
                categories=categories,
                published=published,
                authors=[a.name for a in getattr(entry, "authors", [])][:5],
                url=entry.link,
            )
        )

    # Be polite to arxiv.
    time.sleep(0.5)
    return papers


def default_window(days: int = 7) -> tuple[date, date]:
    until = date.today()
    since = until - timedelta(days=days)
    return since, until
