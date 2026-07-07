# arxiv-radar

A weekly **frontier digest** for arXiv: fetch new papers in a topic, cluster by theme, and surface the themes that didn't exist last week.

```
$ arxiv-radar weekly --topic q-bio.GN --topic cs.LG

ARXIV RADAR · 2026-04-29 → 2026-05-06
─────────────────────────────────────────────────────────────
Total new papers: 318  (q-bio.GN: 47, cs.LG: 271)

▲ EMERGING THEMES THIS WEEK
  • Long-context protein language models with retrieval
    7 papers · first appearance · papers: 2604.01821, 2604.02014, ...

  • Mechanistic interpretability of biology foundation models
    5 papers · was 1 last week · papers: 2604.01199, ...

= CONTINUING THEMES
  • Scaling laws for molecular property prediction (12, was 14)
  • CRISPR base editor design from sequence (8, was 7)

▼ RECEDING
  • Diffusion models for de novo protein design (3, was 11)
─────────────────────────────────────────────────────────────
```

Most paper trackers (Papers With Code, arxiv-sanity) tell you which papers were posted. That's a feed. **arxiv-radar tells you which *themes* are gaining and which are fading** — the shape of the frontier, week over week.

## Why this exists

I want to see the second derivative of research interest. "Diffusion models for proteins" is over. "RNA foundation models" is now. The interesting question isn't *what was published* — it's *what's shifting*.

This is a small tool that runs in ~30 seconds, costs cents in API calls, and produces a markdown digest you can paste into Slack or read on your phone.

## How it works

```
arxiv API ──▶ titles + abstracts ──▶ embeddings (OpenAI or local)
                                              │
                                              ▼
                                      cluster (HDBSCAN)
                                              │
                                              ▼
                                    LLM names each theme
                                              │
                                              ▼
                                diff vs last week's themes
                                              │
                                              ▼
                                       markdown digest
```

Each weekly run is stored in `state/` so the next run can compute the diff. No database.

## Quickstart

```bash
pip install -e .

# add OPENAI_API_KEY to .env, or point at a local OpenAI-compatible endpoint
export OPENAI_API_KEY=sk-...

# fetch last 7 days, two arxiv categories
arxiv-radar weekly --topic q-bio.GN --topic cs.LG

# specify a window
arxiv-radar weekly --topic cs.AI --since 2026-04-22 --until 2026-04-29

# list saved digests
arxiv-radar history
```

The default model is `text-embedding-3-small` for embeddings and `gpt-4o-mini` for theme naming. Override via env:

```bash
ARXIV_RADAR_EMBED_MODEL=local:embed
ARXIV_RADAR_LLM_MODEL=local:chat
ARXIV_RADAR_BASE_URL=http://localhost:8000/v1
```

## Categories

Saved category bundles live in `categories/` as one-line files. Bundled defaults:

| File | What's in it |
|---|---|
| `frontier_ai.txt` | cs.LG, cs.AI, cs.CL, stat.ML |
| `genomics.txt` | q-bio.GN, q-bio.QM, q-bio.MN |
| `interpretability.txt` | cs.LG (filtered by keyword in cluster names) |
| `robotics.txt` | cs.RO, cs.AI |

```bash
arxiv-radar weekly --bundle frontier_ai
```

## What this is not

- Not a comprehensive paper search. Use [arXiv](https://arxiv.org) or [Connected Papers](https://www.connectedpapers.com) for that.
- Not a recommender. Themes are clustered by abstract similarity, not by your reading history.
- Not a leaderboard. There's no ranking of "important" papers — just shifting themes.

## License

MIT.
