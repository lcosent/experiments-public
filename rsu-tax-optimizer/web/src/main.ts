import './style.css';
import { Chart, registerables } from 'chart.js';
import { simulate, generateVestSchedule } from './simulate';

Chart.register(...registerables);

// HTML structure
document.getElementById('app')!.innerHTML = `
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">rsu-tax-optimizer v0.1 · live</span>
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
        <h1 class="project-title">rsu-tax-optimizer</h1>
        <p class="project-desc">A progressive tax calculator and Monte Carlo sell-vs-hold strategy simulator for Tech RSU vests. Compare tax liabilities and risk profiles client-side.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/rsu-tax-optimizer.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel">
        <h2 class="panel-title">1. Simulation Parameters</h2>
        
        <div class="grid-2col">
          <div class="form-group">
            <label class="form-label">Filing Status</label>
            <select class="form-select" id="filing-status">
              <option value="single">Single</option>
              <option value="married_filing_jointly">Married Filing Jointly</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">State</label>
            <select class="form-select" id="state-select">
              <option value="NY">New York (NY)</option>
              <option value="CA">California (CA)</option>
              <option value="TX">No Income Tax (TX, WA)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">W2 Base Salary (USD)</label>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <input type="range" class="range-slider" id="salary-slider" min="50000" max="500000" step="5000" value="180000" style="flex: 1;" />
            <span style="font-family: var(--font-mono); font-weight: 700; width: 85px; text-align: right;" id="salary-text">$180,000</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Total RSU Shares</label>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <input type="range" class="range-slider" id="shares-slider" min="500" max="10000" step="100" value="3000" style="flex: 1;" />
            <span style="font-family: var(--font-mono); font-weight: 700; width: 85px; text-align: right;" id="shares-text">3,000</span>
          </div>
        </div>

        <div class="grid-2col">
          <div class="form-group">
            <label class="form-label">Current Price ($)</label>
            <input class="form-input" type="number" id="price-input" value="120" />
          </div>

          <div class="form-group">
            <label class="form-label">Stock Volatility (%)</label>
            <input class="form-input" type="number" id="vol-input" value="35" />
          </div>
        </div>

        <button class="btn" id="run-simulation-btn">Execute Optimization Model</button>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Recommendation & Projections</h2>
        
        <!-- Simplified Recommendation Panel (Default view) -->
        <div class="report-card" id="recommendation-card" style="background: rgba(16, 185, 129, 0.04); border-color: rgba(16, 185, 129, 0.2);">
          <div class="report-header">
            <span style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Optimization Result</span>
            <span class="report-status" style="color: var(--accent-emerald);">SELL ON VEST</span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-secondary);" id="recommendation-text">
            Loading recommendation...
          </p>
        </div>

        <div style="position: relative; width: 100%; height: 200px;">
          <canvas id="chart-canvas"></canvas>
        </div>

        <!-- Raw Statistics Table (Dev Mode Only) -->
        <div id="results-table" class="dev-mode-only" style="font-size: 0.85rem;">
          <!-- Table summary -->
        </div>
      </section>
    </main>

    <section class="tech-dive-section dev-mode-only">
      <h2 class="panel-title">Technical Deep-Dive</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">
        View progressive marginal tax brackets simulation formulas (Federal + FICA + NIIT + State) written in client-side TypeScript.
      </p>
      <div class="code-snippet-wrap">
        <pre><code style="color: var(--accent-emerald);">// Monte Carlo simulation increments formula:
// dS = S * (mu * dt + sigma * dW)
// Increments = (mu - 0.5 * sigma^2) * dt + sigma * sqrt(dt) * z</code></pre>
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

// DOM Handles
const devModeToggle = document.getElementById('dev-mode-toggle') as HTMLInputElement;
const filingSelect = document.getElementById('filing-status') as HTMLSelectElement;
const stateSelect = document.getElementById('state-select') as HTMLSelectElement;
const priceInput = document.getElementById('price-input') as HTMLInputElement;
const volInput = document.getElementById('vol-input') as HTMLInputElement;
const runBtn = document.getElementById('run-simulation-btn') as HTMLButtonElement;
const resultsTable = document.getElementById('results-table')!;
const chartCanvas = document.getElementById('chart-canvas') as HTMLCanvasElement;

// Slider Handles
const salarySlider = document.getElementById('salary-slider') as HTMLInputElement;
const salaryText = document.getElementById('salary-text')!;
const sharesSlider = document.getElementById('shares-slider') as HTMLInputElement;
const sharesText = document.getElementById('shares-text')!;

// Recommendation Card Handles
const recCard = document.getElementById('recommendation-card')!;
const recText = document.getElementById('recommendation-text')!;

// CLI copy helper
const copyBtn = document.getElementById('copy-cli-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('git clone https://github.com/lcosent/rsu-tax-optimizer.git');
    copyBtn.innerText = 'Copied!';
    setTimeout(() => {
      copyBtn.innerText = 'Copy';
    }, 2000);
  });
}

// Dev Mode Listener
devModeToggle.addEventListener('change', () => {
  if (devModeToggle.checked) {
    document.body.classList.add('dev-mode-active');
  } else {
    document.body.classList.remove('dev-mode-active');
  }
});

// Update slider labels dynamically
salarySlider.addEventListener('input', () => {
  salaryText.innerText = `$${parseInt(salarySlider.value).toLocaleString()}`;
});
sharesSlider.addEventListener('input', () => {
  sharesText.innerText = parseInt(sharesSlider.value).toLocaleString();
});

let chartInstance: Chart | null = null;

function runSimulation() {
  const profile = {
    filing_status: filingSelect.value,
    state: stateSelect.value,
    salary_w2_usd: parseFloat(salarySlider.value),
    vests: generateVestSchedule(parseFloat(sharesSlider.value), '2025-01-01', 12, 48, 'monthly'),
    current_price: parseFloat(priceInput.value),
    drift_annual: 0.08,
    vol_annual: parseFloat(volInput.value) / 100
  };

  const results = simulate(profile, 1000);
  if (results.length === 0) return;

  const sellImmediatelyResult = results[0];
  const hold1yResult = results[1];

  // Update Recommendation Text
  // Standard recommendation logic:
  // If hold strategy downside risk is very high (vol > 20%), advise Sell Immediately to lock in gains.
  const riskDiff = hold1yResult.downside_risk - sellImmediatelyResult.downside_risk;
  if (riskDiff > 5) {
    recCard.style.borderColor = "rgba(16, 185, 129, 0.25)";
    recCard.style.background = "rgba(16, 185, 129, 0.04)";
    recText.innerHTML = `Our progressive model suggests <b>Sell on Vest</b>. Holding shares for 1 year increases your downside volatility by <b>${riskDiff.toFixed(1)}%</b> with minimal expected median gains. Selling on vest minimizes concentration risk.`;
  } else {
    recCard.style.borderColor = "rgba(139, 92, 246, 0.25)";
    recCard.style.background = "rgba(139, 92, 246, 0.04)";
    recText.innerHTML = `Your profile shows a balanced risk tolerance. <b>Hold One Year</b> provides potential long-term capital gains tax benefits (saving state margins), but expose yourself to stock price volatility.`;
  }

  // Render Table (Dev Mode only)
  resultsTable.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 1rem;">
      <thead>
        <tr style="border-bottom: 1px solid var(--panel-border); color: var(--text-secondary); text-transform: uppercase; font-size: 0.75rem;">
          <th style="padding: 0.5rem 0;">Strategy</th>
          <th style="padding: 0.5rem 0;">P25 (Worst Case)</th>
          <th style="padding: 0.5rem 0; font-weight: 700; color: var(--text-primary);">Median</th>
          <th style="padding: 0.5rem 0;">P75 (Best Case)</th>
          <th style="padding: 0.5rem 0;">Downside Risk</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
          <tr style="border-bottom: 1px solid var(--panel-border);">
            <td style="padding: 0.75rem 0; font-weight: 600; color: var(--accent-indigo);">${r.name}</td>
            <td style="padding: 0.75rem 0;">$${r.p25.toLocaleString()}</td>
            <td style="padding: 0.75rem 0; font-weight: 700;">$${r.median.toLocaleString()}</td>
            <td style="padding: 0.75rem 0;">$${r.p75.toLocaleString()}</td>
            <td style="padding: 0.75rem 0; color: var(--accent-rose);">${r.downside_risk}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Render Chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: results.map(r => r.name),
      datasets: [
        {
          label: 'Worst Case (P25)',
          data: results.map(r => r.p25),
          backgroundColor: 'rgba(244, 63, 94, 0.45)',
          borderColor: 'var(--accent-rose)',
          borderWidth: 1
        },
        {
          label: 'Expected Median',
          data: results.map(r => r.median),
          backgroundColor: 'rgba(99, 102, 241, 0.55)',
          borderColor: 'var(--accent-indigo)',
          borderWidth: 1
        },
        {
          label: 'Best Case (P75)',
          data: results.map(r => r.p75),
          backgroundColor: 'rgba(16, 185, 129, 0.45)',
          borderColor: 'var(--accent-emerald)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f8fafc', font: { family: 'Inter', size: 10 } }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 9 },
            callback: (val) => `$${Number(val).toLocaleString()}`
          }
        }
      }
    }
  });
}

runBtn.addEventListener('click', runSimulation);

// Initial run
runSimulation();

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
