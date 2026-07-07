"""End-to-end pipeline: fetch -> embed -> cluster -> name -> diff -> markdown."""

from __future__ import annotations

from datetime import date
from pathlib import Path

from .cluster import cluster as cluster_embeddings
from .diff import ThemeRow, diff, load_previous, save_current
from .embed import embed
from .fetch import Paper, fetch
from .theme import name_theme


def build_digest(topics: list[str], since: date, until: date, k: int | None = None) -> str:
    papers = fetch(topics, since, until)
    if not papers:
        return f"# arxiv-radar {since} → {until}\n\nNo papers found.\n"

    texts = [f"{p.title}\n{p.abstract}" for p in papers]
    vectors = embed(texts)
    clusters = cluster_embeddings(vectors, k=k)

    rows: list[ThemeRow] = []
    for c in clusters:
        reps = [(papers[i].title, papers[i].abstract) for i in c.paper_indices[:5]]
        theme, note = name_theme(reps)
        rows.append(
            ThemeRow(
                theme=theme,
                note=note,
                count=len(c.paper_indices),
                centroid=c.centroid.tolist(),
                paper_ids=[papers[i].arxiv_id for i in c.paper_indices],
            )
        )

    state_dir = Path("state")
    previous = load_previous(state_dir)
    diff_result = diff(rows, previous)
    save_current(state_dir, label=f"{until:%Y%m%d}", rows=rows)

    return render(papers, topics, since, until, diff_result)


def render(papers: list[Paper], topics: list[str], since: date, until: date, d) -> str:
    cat_counts: dict[str, int] = {}
    for p in papers:
        for cat in p.categories:
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
    cat_line = ", ".join(f"{cat}: {n}" for cat, n in sorted(cat_counts.items()) if cat in topics)

    lines = [
        f"# ARXIV RADAR · {since} → {until}",
        "",
        f"Total new papers: **{len(papers)}**  ({cat_line})",
        "",
        "## ▲ Emerging themes this week",
    ]
    for row, prev in sorted(d.emerging, key=lambda x: -x[0].count):
        lines.append(f"- **{row.theme}** — {row.count} papers · first appearance")
        if row.note:
            lines.append(f"  {row.note}")
        lines.append(f"  ids: {', '.join(row.paper_ids[:8])}")
    if not d.emerging:
        lines.append("- (none)")

    lines += ["", "## = Continuing themes"]
    for row, prev in sorted(d.continuing, key=lambda x: -x[0].count):
        delta = row.count - prev
        sign = "+" if delta >= 0 else ""
        lines.append(f"- **{row.theme}** — {row.count} ({sign}{delta} vs last week)")
    if not d.continuing:
        lines.append("- (none)")

    lines += ["", "## ▼ Receding themes (gone this week)"]
    for theme, count in d.receding:
        lines.append(f"- ~~{theme}~~ — was {count} last week")
    if not d.receding:
        lines.append("- (none)")

    return "\n".join(lines) + "\n"
