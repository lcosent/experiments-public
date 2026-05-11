# Watchlists

This folder holds local copies of public sanctions and PEP lists.

| File | Source | Format |
|---|---|---|
| `ofac_sdn.csv` | https://www.treasury.gov/ofac/downloads/sdn.csv | one full-name per row, first column |
| `eu_consolidated.csv` | https://webgate.ec.europa.eu/fsd/fsf/public/files/ (EU FSD) | one full-name per row |
| `un_consolidated.csv` | https://scsanctions.un.org/resources/xml/en/consolidated.xml (convert) | one full-name per row |

Run `kyc-validator update-lists` (stub) for source URLs. We do not bundle the raw lists to avoid stale data — fetch them on first use.

Each CSV: one row per name, single column. Names will be normalized (NFKD, uppercase) before fuzzy matching with rapidfuzz `WRatio` at threshold 92.
