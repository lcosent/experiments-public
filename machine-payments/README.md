# MachinePay

> **A demo of an AI agent that buys things on your behalf — with a strict budget, a tamper-proof receipt for every purchase, and a single statement at the end that reconciles credit-card spend with crypto spend.**

You give the agent a budget. The agent goes shopping. When it's done, you get one clean statement that ties every dollar to a signed receipt — whether the dollar moved over a Visa card or over a blockchain.

This is a proof of concept. Everything below runs on **testnet money** (free fake USDC on Ethereum's Sepolia network). Don't connect real funds. The blueprint is in [`design.md`](./design.md); the literal setup steps are in [`RUNBOOK.md`](./RUNBOOK.md).

---

## The problem this is trying to solve

AI agents are going to buy things. Compute, API calls, services, physical goods. Today, when an agent spends money, you have three options:

1. **Give it your card.** Easy, but no real budget enforcement and no way to prove later *what* it bought.
2. **Build a custom integration per vendor.** Doesn't scale.
3. **Give it a crypto wallet.** Works for crypto-native vendors. Doesn't work for anyone else.

**MachinePay shows a fourth option**: one credential model — built on Visa's **Machine Payment Protocol (MPP)** — that works for *both* card rails and crypto rails. Same agent. Same budget rules. Same audit trail at the end.

---

## The cast of characters

| Who | What they do | Who they are in this demo |
| --- | --- | --- |
| **Principal** | The human (or business) whose money is being spent. Sets the budget. | You. |
| **Agent** | An AI that decides what to buy. Bounded by the Principal's rules. | A small Claude-driven loop in this repo. |
| **Vendors** | Sell things to the Agent. Two of them, with different payment habits. | Two mock services running locally. |
| **Settlement Layer** | The thing that actually moves the money. | Either a Visa-card endpoint *or* an Ethereum smart contract. |
| **Receipt Book** | Records every step, signed and tamper-evident. | A Postgres database (Supabase). |
| **Auditor** | At the end, checks that the receipts match what actually happened. | A small reconciler script. |

---

## The story, in plain English

Imagine you're going on a trip and you hand your assistant a corporate card with three rules: *spend at most $50, only at coffee shops or bookstores, and only today.*

MachinePay does the same thing, except:

- The "card" is a **cryptographically signed permission slip** (a delegation JWT).
- The "assistant" is an **AI agent** that reads the rules and won't break them — because if it tries, the vendors won't accept the payment.
- The "rules" can include *whatever* you want: a spend ceiling, a merchant allowlist, a deadline.
- Every coffee or book it buys produces a **receipt** that's mathematically tied back to your original permission slip.
- At the end of the day, you get **one statement** that lists every purchase — whether the assistant paid by tapping the card or by handing the cashier digital cash — and an auditor confirms each line matches the actual money movement.

---

## The three ways the agent can pay

The Agent has three "wallets" it can pull from, each with its own personality:

| | **USDC Escrow** | **Credit Line** | **Visa Card** |
| --- | --- | --- | --- |
| **Think of it as…** | A deposit you give the vendor up front, with the change refunded at the end. | An overdraft you can borrow against if a job runs over budget. | A normal credit card swipe at checkout. |
| **Where the money lives** | A smart contract on Ethereum (testnet). | A different smart contract on Ethereum (testnet). | A mock card processor. |
| **How it settles** | Vendor cryptographically signs the final amount; the contract pays them out and refunds the rest. | Agent borrows USDC against posted collateral, then repays. | Standard "authorize → capture" flow. |
| **Why have all three?** | Crypto-native vendors who don't take cards. | A safety net when a job costs more than expected. | Legacy vendors who only take cards. |

The point of the demo: **one agent, with one set of rules, can use all three** without bespoke per-vendor code.

---

## The demo, step by step

What follows is what you'll *see* when you run the demo. We'll walk through the most complete tier (Tier 3, on real testnet). Tiers 1 and 2 are simpler stepping stones — same story, fewer moving parts.

### Step 0 — Setup (one-time, ~5 minutes)

You install the project, install the local database, install the Solidity tools, and put a few API keys in a `.env` file. The keys you need (an Anthropic key for the agent's brain, a Privy key for the agent's wallet, an Alchemy URL for talking to Ethereum) are explained in [`RUNBOOK.md`](./RUNBOOK.md). Then:

```bash
pnpm install
pnpm dev          # starts the mock vendors on http://localhost:3000
```

### Step 1 — The Principal hands the Agent a permission slip

The Principal says: *"You can spend up to $5 USDC, only at `dcomp` or `hyperscaler`, only in the next 10 minutes."*

Under the hood, this becomes a **delegation JWT** — a small signed token that contains:
- A spend cap (`$5`)
- A list of allowed merchants (`[dcomp, hyperscaler]`)
- An expiry timestamp

The first row appears in the receipt book:

> 📝 Receipt #1 — *Delegation issued*. Principal granted Agent up to $5 at {dcomp, hyperscaler} until 10:42am.

### Step 2 — The Agent shops around

The Agent (an LLM in a tool-calling loop) decides it needs to rent some GPU time. It calls each vendor and asks for a quote:

- 🛒 `dcomp` (crypto-native) says: **"$4 USDC, paid via on-chain escrow."**
- 🛒 `hyperscaler` (card-only) says: **"$5, charged to a card."**

The Agent picks `dcomp` because it's cheaper.

### Step 3 — The Agent opens an escrow on-chain

The Agent now wants to commit $4 USDC to `dcomp`. Instead of just handing it over, it uses an **escrow**: it deposits $4 into a smart contract, with instructions that say *"pay `dcomp` whatever it actually charges, refund me the rest."*

Two real transactions hit Ethereum Sepolia:

1. **`USDC.approve`** — give the escrow contract permission to move $4 from the agent's wallet.
2. **`Escrow.openJob(dcomp, $4, deadline, intentHash, taskId)`** — the contract pulls the $4 in and emits a `JobOpened` event with a unique `jobId`.

The receipt book now has:

> 📝 Receipt #2 — *Intent*. Agent committed to paying `dcomp` up to $4 for task `task_x7…`.
> 🔗 On-chain event — `JobOpened(jobId=42, payer=Agent, payee=dcomp, amount=$4)`.

### Step 4 — The job runs over budget; the Agent draws from the credit line

While the GPU job is running, `dcomp` updates its meter: it's going to cost **$3.90**, but the agent's escrow is fine for that. Then later, a *different* task overshoots — the agent has only $2 left in its wallet but owes $2 more.

Rather than abort, the Agent draws from its **credit line**. The `CreditLine` contract is essentially an over-collateralized lending pool, so the Agent:

1. Posts $4 of USDC as collateral (50% loan-to-value).
2. Borrows $2 of USDC against it.

Three real transactions; three new receipts.

> 📝 Receipt #3 — *Collateral posted* ($4).
> 📝 Receipt #4 — *Borrowed* ($2).
> 🔗 On-chain events — `CollateralPosted`, `Borrowed`.

### Step 5 — The job finishes; the vendor signs off

`dcomp` finishes the work. The Agent calls `/settle($3.90)` on `dcomp`. Here's the clever part:

- `dcomp` doesn't just *say* "$3.90". It **cryptographically signs** the message `(escrow_address, job_id, $3.90)` with its private key.
- The Agent takes that signature and calls **`Escrow.settle(jobId=42, $3.90, signature)`** on-chain.
- The smart contract **recovers the signer's address** from the signature, checks that it matches the vendor address recorded back in Step 3, and only *then* releases the funds.

Result:
- $3.90 USDC moves from the escrow contract → `dcomp`.
- $0.10 USDC refund moves from the escrow contract → Agent.

> 📝 Receipt #5 — *Settlement countersigned* ($3.90).
> 🔗 On-chain event — `JobSettled(jobId=42, finalAmount=$3.90, refund=$0.10)`.

### Step 6 — The Agent repays the credit line

With money coming back in, the Agent immediately repays its $2 loan.

> 📝 Receipt #6 — *Repaid* ($2). Principal is back to zero.
> 🔗 On-chain event — `Repaid(amount=$2)`.

### Step 7 — The Auditor reconciles

The reconciler script wakes up and asks: *"For every receipt, is there a matching on-chain event with the same amount? For every on-chain event, is there a matching receipt?"*

It prints the **unified statement**:

```jsonc
{ "task": "task_x7…",
  "rail": "usdc_escrow",
  "amount_per_receipt": 3.90,
  "amount_per_blockchain": 3.90,    // ✅ they match
  "anomalies": [] }

{ "task": "task_x7…",
  "rail": "credit_line",
  "borrowed": 2.00,
  "repaid": 2.00,
  "anomalies": [] }
```

If anything had been off — receipt says $3.90 but the chain shows $4.00, or a receipt with no chain event — it would show up under `anomalies`. That's the audit trail.

You can independently verify every transaction on [Sepolia Etherscan](https://sepolia.etherscan.io/) using the contract addresses below — this repo doesn't have to be trusted.

---

## The three demo tiers

The demo runs in three tiers. Each one swaps out a piece of "fake" infrastructure for the real thing — but the agent's code never changes.

| Tier | What's real | What's faked | Why |
| --- | --- | --- | --- |
| **Tier 1** | The agent, the rules, the vendors-as-HTTP. | The database (in-memory) and the blockchain (in-memory). | Prove the loop works in 30 seconds, no external dependencies. |
| **Tier 2** | Tier 1 + a real Postgres database storing every receipt. | The blockchain. | Prove the receipts are durable and queryable. |
| **Tier 3** | Tier 2 + a real blockchain (Ethereum Sepolia testnet). | Nothing — vendors are mock services, but every payment is a real on-chain transaction. | Prove the same agent code drives a real contract. |

### Running Tier 1 (~30 seconds, no setup)

```bash
pnpm install
pnpm dev                  # Terminal 1: starts mock vendors
pnpm script:agent         # Terminal 2: runs the demo
```

You'll see the agent shop, pay, draw credit, settle, and print a reconciled statement.

### Running Tier 2 (~2 minutes, needs Supabase CLI)

Adds a local Postgres database. The receipts now persist; you can open Supabase Studio at `http://127.0.0.1:54323` and run SQL like:

```sql
select * from mpp_receipts;
select * from onchain_events;
select * from unified_statement;
```

### Running Tier 3 (~5 minutes, needs testnet USDC)

Adds the real Ethereum Sepolia network. Each run consumes about **$4 of testnet USDC** (free; you faucet it). The full setup, including the Privy server wallet, Alchemy RPC URL, and contract deploys, is in [`RUNBOOK.md`](./RUNBOOK.md).

**Currently deployed contracts (Ethereum Sepolia):**

| Contract / actor | Address |
| --- | --- |
| `Escrow.sol` | [`0x7590cD3bA111Bd05Fb289A63e92464cc8B283e0F`](https://sepolia.etherscan.io/address/0x7590cD3bA111Bd05Fb289A63e92464cc8B283e0F) |
| `CreditLine.sol` | [`0xdf36B0c9B26067e3B8477b9259ED426DA79fd150`](https://sepolia.etherscan.io/address/0xdf36B0c9B26067e3B8477b9259ED426DA79fd150) |
| USDC (Circle testnet) | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Agent's server wallet | `0x3545fD7761c6Bd5Ef17c5Ac65c369d44E26ccA9F` |

---

## What's intentionally simplified (so you don't mistake it for a bug)

This is a PoC. Each of the following is a deliberate corner that was cut, not a defect:

- **Every Tier 3 run costs ~$4 in testnet USDC.** You'll need to top up between runs.
- **The credit line uses USDC as both collateral and debt** — useful for showing the borrow/repay mechanic, not safe for production. A real version would price collateral against an oracle (e.g., post ETH, borrow USDC).
- **The agent doesn't withdraw collateral at the end of a run**, so $4 of USDC stays parked in the credit-line contract after each run. It's withdrawable; the script just doesn't bother.
- **No "metering" mid-job.** The contracts support periodic updates as a job runs, but the demo script jumps straight from "open escrow" to "settle."
- **Mock vendor state lives in memory.** If you restart the Next.js server, prior in-flight jobs disappear.
- **Each run produces 6–8 separate transactions.** A production version would batch them in a smart-contract wallet (ERC-4337) — much cheaper, but more complex to demo.
- **The signing key is fixed at startup** (either a raw EOA or a Privy server wallet). No runtime rotation.

---

## Tests

| Command | What it runs |
| --- | --- |
| `pnpm test` | 91 TypeScript tests covering the MPP receipts, the guardrails, the agent handlers, the reconciler, and every port. |
| `forge test` | 12 Solidity tests for the escrow and credit-line contracts. |
| `pnpm typecheck` / `pnpm lint` | Strict TS + ESLint + Prettier. |
| `pnpm demo` | A 30-second offline walkthrough of just the MPP receipt flow — no DB, no chain. |
| `pnpm script:agent` | The full end-to-end demo. Behavior depends on which tier's env vars are set; see [`RUNBOOK.md`](./RUNBOOK.md). |

---

## Repo layout

| What you'll find there | Where |
| --- | --- |
| Web app + API routes (the mock vendors, the Principal dashboard) | `apps/web/` |
| The Agent itself (the tool-calling LLM loop) | `apps/agent/` |
| The MPP simulator (the thing that issues receipts) | `services/mpp-sim/` |
| The reconciler / auditor | `services/reconciler/` |
| The smart contracts (`Escrow.sol`, `CreditLine.sol`) | `contracts/` (Foundry) |
| On-chain client helpers | `packages/onchain/` |
| Shared types (receipt shapes, task shapes, ledger rows) | `packages/types/` |
| Postgres schema | `supabase/migrations/` |
| End-to-end demo script | `scripts/agent.ts` |
| Step-by-step setup | `RUNBOOK.md` |
| Full architectural blueprint | `design.md` |

---

## Why this exists

To make one claim concrete: **the same agent, under the same budget rules, with the same audit trail, can pay over both a card rail and a blockchain rail.** No bespoke integration per vendor. No "crypto stack" vs. "fiat stack." One credential — MPP — and one statement at the end.

The goal isn't to ship this as-is. It's to make the architecture concrete enough that a production version can be built off this skeleton.
