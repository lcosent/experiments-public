# rsu-tax-optimizer

A simulator and **sell-vs-hold optimizer** for RSUs at a US tech company. Loads your vest schedule, projects taxes year-over-year, and computes the expected after-tax value of three strategies under a stochastic stock-price path.

```
$ rsu-tax-optimizer simulate --profile profiles/example.yaml --runs 1000

Vesting schedule:    4-year, monthly, with 1y cliff
Vested + future:     12,000 shares
Today's price:       $185
Expected vol:        38% annual

STRATEGY COMPARISON (expected after-tax USD, median over 1,000 runs)
─────────────────────────────────────────────────────────────────
  sell_immediately      $1,824,000   p25: $1,612k  p75: $2,041k
  hold_one_year         $1,896,000   p25: $1,488k  p75: $2,372k
  hold_to_vest_end      $1,742,000   p25: $1,072k  p75: $2,594k
─────────────────────────────────────────────────────────────────

  sell_immediately wins on risk-adjusted basis (Sharpe-like).
  hold_to_vest_end has 18% chance of >30% drawdown.
```

## Why this exists

Tech workers receiving RSUs face three structural surprises:

1. **Withholding under-shoots.** The default 22% supplemental rate often leaves a five- to six-figure shortfall in April for high earners.
2. **The "hold-and-pray" tax trap.** Holding vested RSUs for a year for long-term capital gains exposes you to single-stock concentration risk that usually outweighs the tax savings.
3. **Quarterly estimated taxes** are rarely set up correctly the year a big tranche vests.

This tool runs the numbers explicitly. It does **not** tell you what to do — it shows you what each strategy means in expected value and tail risk.

## What it does

```
your inputs              tax model                  strategy
─────────────            ─────────────              ─────────────
vest schedule    ─────▶  withholding (federal)      sell_immediately
share count               + supplemental rate       hold_one_year
strike (= grant FMV)      + state                   hold_to_vest_end
income, filing            + medicare/SS
state                     + AMT check
                          + NIIT
                          + LTCG / STCG
                          + estimated tax safe harbor

stock price path:  Geometric Brownian Motion with configurable drift/vol
strategies:        run all three, Monte Carlo over price paths
output:            distribution of after-tax USD per strategy
```

## Quickstart

```bash
pip install -e .

# fill in your details once
cp profiles/example.yaml profiles/mine.yaml
$EDITOR profiles/mine.yaml

# explain what will happen on the next vest
rsu-tax-optimizer next-vest --profile profiles/mine.yaml

# project the full year's taxes
rsu-tax-optimizer project-year --profile profiles/mine.yaml

# Monte Carlo over sell-vs-hold strategies
rsu-tax-optimizer simulate --profile profiles/mine.yaml --runs 1000

# AMT exposure check (for ISO holders — RSUs are not subject, but bundled here for completeness)
rsu-tax-optimizer amt-check --profile profiles/mine.yaml
```

## What it covers

| Concept | Modeled |
|---|---|
| Federal income tax (2026 brackets, MFJ + Single) | ✓ |
| Social Security + Medicare (incl. additional Medicare 0.9%) | ✓ |
| State income tax (CA, NY, WA, TX presets — flat or progressive) | ✓ |
| Supplemental wage withholding (22% / 37% over $1M) | ✓ |
| Underpayment safe harbor (110% prior year for high earners) | ✓ |
| Long-term vs short-term capital gains | ✓ |
| Net Investment Income Tax (NIIT) | ✓ |
| AMT (lookup, not full computation) | partial |
| State source rules on multi-state vests | not modeled |

## Profile format

```yaml
# profiles/mine.yaml
filing_status: married_filing_jointly
state: CA
salary_w2_usd: 280_000

vest_schedule:
  total_shares: 12_000
  start_date: 2024-08-01
  cliff_months: 12
  total_months: 48
  frequency: monthly

stock:
  current_price_usd: 185.00
  expected_drift_annual: 0.10
  expected_vol_annual: 0.38

strategy:
  sell_to_cover_default: true
  hold_to_long_term: false
```

## Disclaimers

- **Not tax advice.** Numbers are illustrative. Bracket assumptions drift. Run with your CPA.
- **State coverage is shallow.** Only CA, NY, WA (none), TX (none). PRs welcome.
- **AMT is partial.** Computed via a simplified lookup. If you also hold ISOs, run AMT through real software.

## License

MIT.
