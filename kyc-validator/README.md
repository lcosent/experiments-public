# kyc-validator

A **local-only** KYC document validator. PII never leaves the machine. Built for the case where you need LLM-style structured extraction but cannot — for compliance, contractual, or jurisdictional reasons — send customer documents to OpenAI or Anthropic.

```
$ kyc-validator check ~/docs/passport_scan.jpg

document type        passport (confidence 0.96)
issuing country      ITA
holder name          MARIO ROSSI
date of birth        1985-03-14   ✓ over 18
expiry date          2031-08-22   ✓ valid (5y, 3m remaining)
document number      YA1234567    ✓ checksum valid

watchlist            PASS  (OFAC SDN, UN, EU consolidated)
sanctions match      none
PEP match            none

risk score           LOW   (3.2 / 100)
verdict              ACCEPT
```

## Why this exists

Most LLM-based KYC tools route document images through cloud APIs. That is:

- A privacy problem (passport scans, utility bills, faces).
- A regulatory problem (Schrems II, GDPR Article 44, banking secrecy laws in CH/DE/IT, NY Part 500, MAS).
- A vendor risk problem (third-party model providers in your KYC pipeline = a new compliance surface).

**kyc-validator does it all locally.** OCR runs on-device (Tesseract or PaddleOCR). The LLM that structures the extracted text runs against a local OpenAI-compatible endpoint (LM Studio, Ollama, llama.cpp). Watchlist screening uses local copies of OFAC SDN and EU consolidated lists.

You get the benefits of LLM-style document understanding **without ever calling a cloud model**.

## What it does

```
              ┌─────────────────────┐
image / PDF ──▶  on-device OCR     │── raw text
              └─────────────────────┘
                        │
              ┌─────────▼───────────┐
              │  local LLM extracts │── structured fields
              │  via JSON schema    │   (name, DOB, doc #, ...)
              └─────────┬───────────┘
                        │
              ┌─────────▼───────────┐
              │  rule-based checks  │── checksum, age, expiry,
              │  + watchlists       │   format, regex, OFAC/EU
              └─────────┬───────────┘
                        │
                  ACCEPT | REVIEW | REJECT
                  (with reasons)
```

## Quickstart

```bash
pip install -e .

# point at any OpenAI-compatible local endpoint
export KYC_BASE_URL=http://localhost:8000/v1
export KYC_MODEL=chat

# bring local OFAC + EU lists up to date (downloads once, runs offline after)
kyc-validator update-lists

# run on a document
kyc-validator check ./test_documents/passport_synthetic.txt

# run a batch
kyc-validator batch ./test_documents/ --out ./reports/
```

`./test_documents/` ships with **synthetic** sample text files (no real PII). They demonstrate the full pipeline without requiring OCR on actual scans.

## Supported documents

| Type | Fields extracted | Validation |
|---|---|---|
| Passport (MRZ) | Country, name, DOB, sex, doc#, expiry | MRZ checksum, expiry, format |
| National ID (EU) | Country, name, DOB, doc#, expiry | Country-specific format, expiry |
| Driver's license (US/EU) | State/country, name, DOB, doc#, expiry, class | Format, expiry |
| Utility bill (proof of address) | Provider, customer name, address, date | Date recency, name match |
| Tax ID | Country, number | Country-specific checksum (IT codice fiscale, US SSN format, etc.) |

## Watchlists

Bundled support for:

- **OFAC SDN** (US Treasury Specially Designated Nationals)
- **EU Consolidated Financial Sanctions List**
- **UN Security Council Consolidated List**

`kyc-validator update-lists` fetches the latest XML feeds from the official sources. Matching uses normalized name comparison + Levenshtein distance for typos. **Match decisions require human review** — the tool never auto-rejects on a sanctions hit.

## What this is not

- **Not a replacement** for a regulated KYC vendor (Onfido, Sumsub, Jumio). It does not perform liveness detection, biometric face match, or document tamper detection.
- **Not an OCR project.** It uses existing OCR libraries. The value is the local LLM-driven structured extraction + rule engine.
- **Not legal advice.** Whether a given KYC workflow satisfies your regulator is a question for your compliance officer, not this README.

## License

MIT. OFAC and EU sanctions data are public.
