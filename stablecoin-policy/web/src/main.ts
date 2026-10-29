import './style.css';
import { compilePolicy, evaluate } from '../../src/index';

const defaultPolicy = `version: 1
metadata:
  name: retail_payment_v1
  jurisdiction: US
  description: >
    Retail stablecoin payment under bank CTR/SAR thresholds.
    Merchant sees amount + counterparty display name.
    Regulator view only triggers above CTR threshold.

predicates:
  amount_under_ctr:
    field: amount
    op: lt
    value: 10000
  payer_kyc_at_least_tier2:
    field: payer.kyc_tier
    op: gte
    value: 2
  counterparty_not_sanctioned:
    field: counterparty.sanctions_hits
    op: eq
    value: 0
  same_jurisdiction:
    field: payer.jurisdiction
    op: eq
    field_b: counterparty.jurisdiction

views:
  merchant:
    reveal:
      - amount
      - currency
      - memo
      - payer.display_name
    attest:
      - payer_kyc_at_least_tier2
      - counterparty_not_sanctioned

  aml_regulator:
    when: not(amount_under_ctr)
    reveal:
      - amount
      - currency
      - payer.id
      - counterparty.id
      - payer.jurisdiction
      - counterparty.jurisdiction

  settlement_agent:
    reveal:
      - "*"

  public_chain:
    reveal: []
    attest:
      - amount_under_ctr
      - payer_kyc_at_least_tier2
      - counterparty_not_sanctioned`;

const defaultPayment = `{
  "amount": 8500,
  "currency": "USDC",
  "memo": "invoice 42",
  "payer": {
    "id": "did:p:alice",
    "display_name": "Acme Inc.",
    "legal_name": "Acme Incorporated",
    "kyc_tier": 3,
    "jurisdiction": "US"
  },
  "counterparty": {
    "id": "did:p:bob",
    "display_name": "Beta LLC",
    "legal_name": "Beta LLC",
    "sanctions_hits": 0,
    "jurisdiction": "US"
  }
}`;

// HTML structure
document.getElementById('app')!.innerHTML = `
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">stablecoin-policy v0.1 · live</span>
    </div>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <label class="switch-container">
        <span>Developer Mode</span>
        <input type="checkbox" class="switch-input" id="dev-mode-toggle" />
        <span class="switch-slider"></span>
      </label>
      <span style="color: var(--text-muted);">|</span>
      <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle Dark Mode"></button>
    </div>
  </div>

  <div class="container">
    <header class="showcase-header">
      <div class="project-meta">
        <h1 class="project-title">stablecoin-policy</h1>
        <p class="project-desc">A selective-disclosure compliance engine for stablecoin payments. Compile policies, define rules, and run secure client-side transaction screening evaluations.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/experiments-public.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel">
        <h2 class="panel-title">1. Transaction Parameters</h2>
        
        <!-- User friendly input wizard -->
        <div id="visual-inputs" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="form-group">
            <label class="form-label">Transaction Amount (USDC)</label>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <input type="range" class="range-slider" id="v-amount-slider" min="100" max="25000" step="100" value="8500" style="flex: 1;" />
              <span style="font-family: var(--font-mono); font-weight: 700; width: 70px; text-align: right;" id="v-amount-text">$8,500</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Payer KYC Tier</label>
            <select class="form-select" id="v-kyc-select">
              <option value="1">Tier 1 (Basic)</option>
              <option value="2">Tier 2 (ID Verified)</option>
              <option value="3" selected>Tier 3 (Enhanced)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Counterparty Sanctions Matches</label>
            <select class="form-select" id="v-sanctions-select">
              <option value="0" selected>0 matches (Clear)</option>
              <option value="1">1 match (Warning)</option>
              <option value="3">3 matches (Blocked)</option>
            </select>
          </div>
        </div>

        <!-- Raw Developer Inputs (Toggled via Dev Mode) -->
        <div class="dev-mode-only" style="display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1rem; border-top: 1px solid var(--panel-border); padding-top: 1rem;">
          <div class="form-group">
            <label class="form-label">Declarative Policy (YAML)</label>
            <textarea class="form-textarea" id="policy-input" style="font-family: var(--font-mono); font-size: 0.8rem; min-height: 250px;"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Transaction Payload (JSON)</label>
            <textarea class="form-textarea" id="payment-input" style="font-family: var(--font-mono); font-size: 0.8rem; min-height: 180px;"></textarea>
          </div>
        </div>
        
        <div id="validation-status" style="font-size: 0.85rem; font-family: var(--font-mono); margin-top: 0.5rem;"></div>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Compliance Evaluation</h2>
        
        <div class="form-group">
          <label class="form-label">Select Evaluator Perspective (Role)</label>
          <select class="form-select" id="role-select">
            <option value="merchant">merchant</option>
            <option value="aml_regulator">aml_regulator</option>
            <option value="settlement_agent">settlement_agent</option>
            <option value="public_chain">public_chain</option>
          </select>
        </div>

        <!-- Visual Report Card (Default view) -->
        <div class="report-card" id="visual-report">
          <div class="report-header">
            <span style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Validation Outcome</span>
            <span class="report-status" id="report-status-badge">APPROVED</span>
          </div>
          <div style="font-size: 0.88rem; color: var(--text-secondary);" id="report-summary">
            <!-- Summary points -->
          </div>
        </div>

        <!-- Raw JSON Terminal (Dev Mode Only) -->
        <div class="form-group dev-mode-only">
          <label class="form-label">Raw Evaluated JSON View</label>
          <div class="terminal-output" id="output-box"></div>
        </div>

        <div class="form-group">
          <label class="form-label">Predicate Attestations</label>
          <div id="attestations-summary" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem;"></div>
        </div>
      </section>
    </main>

    <section class="tech-dive-section dev-mode-only">
      <h2 class="panel-title">Technical Deep-Dive</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">
        Integrate the stablecoin policy engine directly in your payment pipeline or off-chain TEE settlement oracle.
      </p>
      
      <div class="code-snippet-wrap">
        <pre><code style="color: var(--accent-emerald);" id="tech-snippet"></code></pre>
      </div>
    </section>

    <footer class="showcase-footer">
      <div>&copy; 2026 Luca Cosentino</div>
      <div class="other-projects-links">
        <a href="https://stablecoin-policy.cosentino.me">stablecoin-policy</a>
        <a href="https://rsu-tax-optimizer.cosentino.me">rsu-tax-optimizer</a>
        <a href="https://agent-debate.cosentino.me">agent-debate</a>
        <a href="https://prompt-eval-arena.cosentino.me">prompt-eval-arena</a>
        <a href="https://life-scenarios.cosentino.me">life-scenarios</a>
      </div>
    </footer>
  </div>
`;

// Handles
const devModeToggle = document.getElementById('dev-mode-toggle') as HTMLInputElement;
const policyInput = document.getElementById('policy-input') as HTMLTextAreaElement;
const paymentInput = document.getElementById('payment-input') as HTMLTextAreaElement;
const roleSelect = document.getElementById('role-select') as HTMLSelectElement;
const outputBox = document.getElementById('output-box')!;
const validationStatus = document.getElementById('validation-status')!;
const attestationsSummary = document.getElementById('attestations-summary')!;
const techSnippet = document.getElementById('tech-snippet')!;

// Visual Controls Handles
const amountSlider = document.getElementById('v-amount-slider') as HTMLInputElement;
const amountText = document.getElementById('v-amount-text')!;
const kycSelect = document.getElementById('v-kyc-select') as HTMLSelectElement;
const sanctionsSelect = document.getElementById('v-sanctions-select') as HTMLSelectElement;

// Visual Report Handles
const reportStatusBadge = document.getElementById('report-status-badge')!;
const reportSummary = document.getElementById('report-summary')!;

policyInput.value = defaultPolicy;
paymentInput.value = defaultPayment;

// CLI copy helper
const copyBtn = document.getElementById('copy-cli-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('git clone https://github.com/lcosent/experiments-public.git');
    copyBtn.innerText = 'Copied!';
    setTimeout(() => {
      copyBtn.innerText = 'Copy';
    }, 2000);
  });
}

// Dev Mode Toggle Listener
devModeToggle.addEventListener('change', () => {
  if (devModeToggle.checked) {
    document.body.classList.add('dev-mode-active');
  } else {
    document.body.classList.remove('dev-mode-active');
  }
});

// Update payment JSON dynamically from sliders
function syncSlidersToPayment() {
  try {
    const val = JSON.parse(paymentInput.value);
    val.amount = parseInt(amountSlider.value);
    val.payer.kyc_tier = parseInt(kycSelect.value);
    val.counterparty.sanctions_hits = parseInt(sanctionsSelect.value);
    
    paymentInput.value = JSON.stringify(val, null, 2);
    amountText.innerText = `$${val.amount.toLocaleString()}`;
    
    updateEvaluation();
  } catch (e) {}
}

// Update sliders from payment JSON (if edited in dev mode)
function syncPaymentToSliders() {
  try {
    const val = JSON.parse(paymentInput.value);
    if (val.amount !== undefined) {
      amountSlider.value = val.amount.toString();
      amountText.innerText = `$${val.amount.toLocaleString()}`;
    }
    if (val.payer?.kyc_tier !== undefined) {
      kycSelect.value = val.payer.kyc_tier.toString();
    }
    if (val.counterparty?.sanctions_hits !== undefined) {
      sanctionsSelect.value = val.counterparty.sanctions_hits.toString();
    }
  } catch(e) {}
}

amountSlider.addEventListener('input', syncSlidersToPayment);
kycSelect.addEventListener('change', syncSlidersToPayment);
sanctionsSelect.addEventListener('change', syncSlidersToPayment);

paymentInput.addEventListener('input', () => {
  syncPaymentToSliders();
  updateEvaluation();
});

function updateEvaluation() {
  const policySrc = policyInput.value;
  const paymentSrc = paymentInput.value;
  const selectedRole = roleSelect.value;

  try {
    const policy = compilePolicy(policySrc);
    const payment = JSON.parse(paymentSrc);
    const result = evaluate(policy, payment, { role: selectedRole });
    
    validationStatus.innerHTML = `<span style="color: var(--accent-emerald)">✓ Policy and payload validated</span>`;
    outputBox.innerHTML = `<div class="terminal-line text" style="color: var(--text-primary); font-weight: 500;">${JSON.stringify(result, null, 2)}</div>`;

    // 1. Process visual outcome badge
    let isApproved = true;
    let failReason = "";

    // Sanction hits block
    if (payment.counterparty?.sanctions_hits > 0) {
      isApproved = false;
      failReason = "Transaction blocked: Counterparty matches global sanctions watchlists.";
    } else if (selectedRole === 'aml_regulator' && payment.amount < 10000) {
      isApproved = false;
      failReason = "No Report: Transaction amount falls below CTR regulator report threshold ($10,000).";
    }

    if (isApproved) {
      reportStatusBadge.innerText = "AUTHORIZED";
      reportStatusBadge.style.color = "var(--accent-emerald)";
      reportSummary.innerHTML = `
        <p style="margin-bottom: 0.5rem;">✓ <b>Rule verification passed</b>: This transaction meets all selective disclosure parameters for the <b>${selectedRole}</b> perspective.</p>
        <p>• Revealed fields: <code style="font-family: var(--font-mono); font-size: 0.75rem;">${Object.keys(result.revealed).join(', ') || 'none'}</code></p>
      `;
    } else {
      reportStatusBadge.innerText = "BLOCKED / REDACTED";
      reportStatusBadge.style.color = "var(--accent-rose)";
      reportSummary.innerHTML = `<p style="color: var(--accent-rose);">⚠ ${failReason}</p>`;
    }

    // 2. Render attestations visually
    if (result.attestations && result.attestations.length > 0) {
      attestationsSummary.innerHTML = result.attestations.map(att => {
        const color = att.value ? 'var(--accent-emerald)' : 'var(--accent-rose)';
        const bg = att.value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';
        return `<span style="border: 1px solid ${color}; background: ${bg}; color: ${color}; font-size: 0.75rem; font-family: var(--font-mono); padding: 0.15rem 0.5rem; border-radius: 4px;">
          ${att.predicate}: ${att.value}
        </span>`;
      }).join('');
    } else {
      attestationsSummary.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">No attestations for this view</span>`;
    }

    // 3. Update code snippet
    techSnippet.innerText = 'import { compilePolicy, evaluate } from "stablecoin-policy";\n\n' +
      'const policy = compilePolicy(`' + policySrc.replace(/`/g, '\\`').slice(0, 250) + '...`);\n' +
      'const payment = ' + JSON.stringify(payment, null, 2) + ';\n\n' +
      'const view = evaluate(policy, payment, { role: "' + selectedRole + '" });\n' +
      'console.log(view.revealed);';

  } catch (err: any) {
    validationStatus.innerHTML = `<span style="color: var(--accent-rose)">✗ Error: ${err.message || err}</span>`;
    outputBox.innerHTML = `<div class="terminal-line error">Compilation or evaluation failed: ${err.message || err}</div>`;
    attestationsSummary.innerHTML = '';
  }
}

policyInput.addEventListener('input', updateEvaluation);
roleSelect.addEventListener('change', updateEvaluation);

// Initial run
updateEvaluation();

// -------------------------------------------------------------
// Manual Dark Mode Toggle Logic
// -------------------------------------------------------------
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme');
  const isDark = storedTheme === 'dark';
  
  if (isDark) {
    document.documentElement.classList.add('dark');
    if (themeToggle) themeToggle.innerHTML = sunIcon;
  } else {
    document.documentElement.classList.remove('dark');
    if (themeToggle) themeToggle.innerHTML = moonIcon;
  }
}

// Initialize immediately to apply theme class before visual render
initTheme();

// Hook up listener to the newly injected button
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    if (isCurrentlyDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = moonIcon;
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = sunIcon;
    }
  });
}
