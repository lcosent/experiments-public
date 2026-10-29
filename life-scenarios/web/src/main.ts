import './style.css';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// HTML Structure
document.getElementById('app')!.innerHTML = `
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">life-scenarios v0.1 · live</span>
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
        <h1 class="project-title">life-scenarios</h1>
        <p class="project-desc">A scenario planning calculator for major life events. Formulate decisions regarding sabbaticals or relocations, and inspect cash-flow trade-offs and hidden risk flags.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/experiments-public.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel">
        <h2 class="panel-title">1. Scenario Configuration</h2>
        
        <div class="form-group">
          <label class="form-label">Scenario Event</label>
          <select class="form-select" id="event-type">
            <option value="sabbatical">12-Month Sabbatical (Career Break)</option>
            <option value="relocation">Relocation (NY to Florida/Texas)</option>
          </select>
        </div>

        <div id="dynamic-inputs" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Populated dynamically based on event selection -->
        </div>

        <button class="btn" id="recalc-btn">Evaluate Scenario</button>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Financial Projections & Risks</h2>
        
        <div id="scenarios-numbers" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.5rem;">
          <!-- Numbers grid -->
        </div>

        <div style="position: relative; width: 100%; height: 180px; margin-bottom: 1rem;">
          <canvas id="cashflow-chart"></canvas>
        </div>

        <div>
          <h4 style="color: var(--accent-rose); font-family: var(--font-header); font-size: 0.95rem; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.25rem;">Surfaced Risk Flags</h4>
          <ul id="risk-flags-list" style="margin-top: 0.5rem; padding-left: 1rem; color: var(--text-secondary); font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <!-- Risks list -->
          </ul>
        </div>
      </section>
    </main>

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
const eventTypeSelect = document.getElementById('event-type') as HTMLSelectElement;
const dynamicInputs = document.getElementById('dynamic-inputs')!;
const recalcBtn = document.getElementById('recalc-btn') as HTMLButtonElement;
const numbersGrid = document.getElementById('scenarios-numbers')!;
const riskFlagsList = document.getElementById('risk-flags-list')!;
const chartCanvas = document.getElementById('cashflow-chart') as HTMLCanvasElement;

// CLI Widget Copy
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

// Dev Mode Listener
devModeToggle.addEventListener('change', () => {
  if (devModeToggle.checked) {
    document.body.classList.add('dev-mode-active');
  } else {
    document.body.classList.remove('dev-mode-active');
  }
});

let chartInstance: Chart | null = null;

const sabbaticalInputsHTML = `
  <div class="form-group">
    <label class="form-label">Current Salary: <span id="sab-salary-val">$280,000</span></label>
    <input type="range" class="range-slider" id="sab-salary" min="80000" max="500000" step="10000" value="280000" />
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
    <div class="form-group">
      <label class="form-label">Monthly Burn: <span id="sab-burn-val">$11,500</span></label>
      <input type="range" class="range-slider" id="sab-burn" min="3000" max="25000" step="500" value="11500" />
    </div>
    <div class="form-group">
      <label class="form-label">Break Duration: <span id="sab-months-val">12 months</span></label>
      <input type="range" class="range-slider" id="sab-months" min="1" max="24" step="1" value="12" />
    </div>
  </div>

  <div class="dev-mode-only form-group" style="border-top: 1px solid var(--panel-border); padding-top: 1rem; gap: 1rem;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div class="form-group">
        <label class="form-label">Unvested RSUs Value</label>
        <input class="form-input" type="number" id="sab-rsu" value="148000" />
      </div>
      <div class="form-group">
        <label class="form-label">Savings Balance</label>
        <input class="form-input" type="number" id="sab-savings" value="165000" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Opportunity Cost Rate</label>
      <div class="terminal-output" style="font-family: var(--font-mono); font-size: 0.75rem; min-height: 50px; padding: 0.5rem;">
        Opportunity Cost = (Salary * 1.05 + RSU) * (Months / 12) + Burn * Months
      </div>
    </div>
  </div>
`;

const relocationInputsHTML = `
  <div class="form-group">
    <label class="form-label">W2 Taxable Salary: <span id="rel-salary-val">$280,000</span></label>
    <input type="range" class="range-slider" id="rel-salary" min="80000" max="500000" step="10000" value="280000" />
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
    <div class="form-group">
      <label class="form-label">Current Rent/COL: <span id="rel-current-col-val">$5,000</span></label>
      <input type="range" class="range-slider" id="rel-current-col" min="1500" max="10000" step="250" value="5000" />
    </div>
    <div class="form-group">
      <label class="form-label">New Rent/COL: <span id="rel-new-col-val">$3,800</span></label>
      <input type="range" class="range-slider" id="rel-new-col" min="1000" max="8000" step="250" value="3800" />
    </div>
  </div>

  <div class="dev-mode-only form-group" style="border-top: 1px solid var(--panel-border); padding-top: 1rem; gap: 1rem;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div class="form-group">
        <label class="form-label">Current State Tax (%)</label>
        <input class="form-input" type="number" id="rel-current-tax" value="9.65" step="0.1" />
      </div>
      <div class="form-group">
        <label class="form-label">New State Tax (%)</label>
        <input class="form-input" type="number" id="rel-new-tax" value="0.0" step="0.1" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Upfront Relocation Cost</label>
      <input class="form-input" type="number" id="rel-cost" value="15000" />
    </div>
  </div>
`;

function attachSabbaticalListeners() {
  const salary = document.getElementById('sab-salary') as HTMLInputElement;
  const burn = document.getElementById('sab-burn') as HTMLInputElement;
  const months = document.getElementById('sab-months') as HTMLInputElement;
  
  const salaryVal = document.getElementById('sab-salary-val')!;
  const burnVal = document.getElementById('sab-burn-val')!;
  const monthsVal = document.getElementById('sab-months-val')!;

  salary.addEventListener('input', () => {
    salaryVal.innerText = `$${parseInt(salary.value).toLocaleString()}`;
    evaluateEvent();
  });
  burn.addEventListener('input', () => {
    burnVal.innerText = `$${parseInt(burn.value).toLocaleString()}`;
    evaluateEvent();
  });
  months.addEventListener('input', () => {
    monthsVal.innerText = `${months.value} months`;
    evaluateEvent();
  });

  document.getElementById('sab-rsu')?.addEventListener('input', evaluateEvent);
  document.getElementById('sab-savings')?.addEventListener('input', evaluateEvent);
}

function attachRelocationListeners() {
  const salary = document.getElementById('rel-salary') as HTMLInputElement;
  const currentCol = document.getElementById('rel-current-col') as HTMLInputElement;
  const newCol = document.getElementById('rel-new-col') as HTMLInputElement;

  const salaryVal = document.getElementById('rel-salary-val')!;
  const currentColVal = document.getElementById('rel-current-col-val')!;
  const newColVal = document.getElementById('rel-new-col-val')!;

  salary.addEventListener('input', () => {
    salaryVal.innerText = `$${parseInt(salary.value).toLocaleString()}`;
    evaluateEvent();
  });
  currentCol.addEventListener('input', () => {
    currentColVal.innerText = `$${parseInt(currentCol.value).toLocaleString()}`;
    evaluateEvent();
  });
  newCol.addEventListener('input', () => {
    newColVal.innerText = `$${parseInt(newCol.value).toLocaleString()}`;
    evaluateEvent();
  });

  document.getElementById('rel-current-tax')?.addEventListener('input', evaluateEvent);
  document.getElementById('rel-new-tax')?.addEventListener('input', evaluateEvent);
  document.getElementById('rel-cost')?.addEventListener('input', evaluateEvent);
}

function loadEventInputs() {
  const event = eventTypeSelect.value;
  if (event === 'sabbatical') {
    dynamicInputs.innerHTML = sabbaticalInputsHTML;
    attachSabbaticalListeners();
  } else {
    dynamicInputs.innerHTML = relocationInputsHTML;
    attachRelocationListeners();
  }
}

eventTypeSelect.addEventListener('change', () => {
  loadEventInputs();
  evaluateEvent();
});

function evaluateEvent() {
  const event = eventTypeSelect.value;

  if (chartInstance) {
    chartInstance.destroy();
  }

  if (event === 'sabbatical') {
    const salaryInput = document.getElementById('sab-salary') as HTMLInputElement;
    const burnInput = document.getElementById('sab-burn') as HTMLInputElement;
    const monthsInput = document.getElementById('sab-months') as HTMLInputElement;
    const rsuInput = document.getElementById('sab-rsu') as HTMLInputElement;
    const savingsInput = document.getElementById('sab-savings') as HTMLInputElement;

    const salary = salaryInput ? parseFloat(salaryInput.value) : 280000;
    const burn = burnInput ? parseFloat(burnInput.value) : 11500;
    const months = monthsInput ? parseFloat(monthsInput.value) : 12;
    const rsu = rsuInput ? parseFloat(rsuInput.value) : 148000;
    const savings = savingsInput ? parseFloat(savingsInput.value) : 165000;

    const runwayNeeded = burn * months;
    const opportunityCost = (salary * 1.05 + rsu) * (months / 12);
    const bufferRec = burn * 3;

    numbersGrid.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--panel-border); border-radius: 6px; padding: 0.75rem; text-align: center;">
        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Runway Required</span><br/>
        <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-rose);">$${runwayNeeded.toLocaleString()}</span>
      </div>
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--panel-border); border-radius: 6px; padding: 0.75rem; text-align: center;">
        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Opportunity Cost</span><br/>
        <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-amber);">$${Math.round(opportunityCost).toLocaleString()}</span>
      </div>
    `;

    const runRemaining = savings - runwayNeeded;
    const alertStyle = runRemaining < 0 
      ? 'background: rgba(244, 63, 94, 0.08); border: 1px solid var(--accent-rose); color: var(--accent-rose);' 
      : 'background: rgba(16, 185, 129, 0.08); border: 1px solid var(--accent-emerald); color: var(--accent-emerald);';
    const alertTitle = runRemaining < 0 ? 'DEFICIT ALERT' : 'RUNWAY SECURED';
    const alertText = runRemaining < 0 
      ? `Insufficient savings! You are short by $${Math.abs(runRemaining).toLocaleString()} to cover this break.`
      : `Savings balance leaves a $${runRemaining.toLocaleString()} buffer after break ends.`;

    riskFlagsList.innerHTML = `
      <div style="${alertStyle} padding: 0.5rem 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; margin-bottom: 0.25rem; text-align: center;">
        ${alertTitle}: ${alertText}
      </div>
      <li><b>Forfeited unvested RSUs</b>: Sabbatical separation triggers immediate forfeiture of $${rsu.toLocaleString()} in stock.</li>
      <li><b>Buffer recommendations</b>: Recommended emergency cash buffer is $${bufferRec.toLocaleString()} (3 months of expenses).</li>
      <li><b>Health COBRA election</b>: Modeled at ~ $850/mo. Ensure COBRA setup is secured prior to separation.</li>
    `;

    // Cash flow chart
    const labels = ['Start', 'Month 3', 'Month 6', 'Month 9', 'Month 12', 'Year 2 (Re-entered)'];
    const sabbaticalPath = [savings, savings - burn*3, savings - burn*6, savings - burn*9, savings - runwayNeeded, savings - runwayNeeded + (salary * 1.08)];
    const baselinePath = [savings, savings + 10000, savings + 20000, savings + 30000, savings + 40000, savings + 80000];

    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Sabbatical Strategy',
            data: sabbaticalPath,
            borderColor: 'var(--accent-rose)',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            borderWidth: 2,
            tension: 0.15
          },
          {
            label: 'Keep Working (Baseline)',
            data: baselinePath,
            borderColor: 'var(--accent-indigo)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderWidth: 2,
            tension: 0.15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#f8fafc', font: { family: 'Inter', size: 10 } } } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 9 } } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 9 }, callback: (v) => `$${Number(v).toLocaleString()}` } }
        }
      }
    });

  } else {
    // Relocation
    const salaryInput = document.getElementById('rel-salary') as HTMLInputElement;
    const curColInput = document.getElementById('rel-current-col') as HTMLInputElement;
    const newColInput = document.getElementById('rel-new-col') as HTMLInputElement;
    const curTaxInput = document.getElementById('rel-current-tax') as HTMLInputElement;
    const newTaxInput = document.getElementById('rel-new-tax') as HTMLInputElement;
    const costInput = document.getElementById('rel-cost') as HTMLInputElement;

    const salary = salaryInput ? parseFloat(salaryInput.value) : 280000;
    const curCol = curColInput ? parseFloat(curColInput.value) : 5000;
    const newCol = newColInput ? parseFloat(newColInput.value) : 3800;
    const curTax = curTaxInput ? parseFloat(curTaxInput.value) / 100 : 0.0965;
    const newTax = newTaxInput ? parseFloat(newTaxInput.value) / 100 : 0.0;
    const cost = costInput ? parseFloat(costInput.value) : 15000;

    const annualTaxSavings = salary * (curTax - newTax);
    const annualColSavings = (curCol - newCol) * 12;
    const monthlySavings = (annualTaxSavings + annualColSavings) / 12;
    const breakevenMonths = Math.round((cost / monthlySavings) * 10) / 10;

    numbersGrid.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--panel-border); border-radius: 6px; padding: 0.75rem; text-align: center;">
        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Annual Total Savings</span><br/>
        <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-emerald);">$${Math.round(annualTaxSavings + annualColSavings).toLocaleString()}</span>
      </div>
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--panel-border); border-radius: 6px; padding: 0.75rem; text-align: center;">
        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Breakeven Horizon</span><br/>
        <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-indigo);">${breakevenMonths} Months</span>
      </div>
    `;

    riskFlagsList.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); padding: 0.5rem 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; margin-bottom: 0.25rem; text-align: center;">
        NET POSITIVE SAVINGS: +$${Math.round(monthlySavings).toLocaleString()} / month
      </div>
      <li><b>Establish tax domicile</b>: Moving to Florida/Texas requires clean physical cutoff (utility bills, driver's license conversion, lease agreements) to avoid ongoing audit issues in NY.</li>
      <li><b>Vesting considerations</b>: Ensure RSU state source tax allocation is computed correctly. Vests are sourced based on working locations during the grant-to-vest period.</li>
    `;

    // Cash flow chart
    const labels = ['Start', 'Month 3', 'Month 6', 'Month 9', 'Month 12', 'Month 18'];
    const pathReloc = [-cost, -cost + monthlySavings*3, -cost + monthlySavings*6, -cost + monthlySavings*9, -cost + monthlySavings*12, -cost + monthlySavings*18];
    const pathNoReloc = [0, 0, 0, 0, 0, 0];

    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Relocation Net Savings',
            data: pathReloc,
            borderColor: 'var(--accent-emerald)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderWidth: 2,
            tension: 0.15
          },
          {
            label: 'Stay in NY (Baseline)',
            data: pathNoReloc,
            borderColor: 'var(--text-muted)',
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#f8fafc', font: { family: 'Inter', size: 10 } } } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 9 } } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 9 }, callback: (v) => `$${Number(v).toLocaleString()}` } }
        }
      }
    });
  }
}

recalcBtn.addEventListener('click', evaluateEvent);

// Initial Load
loadEventInputs();
evaluateEvent();


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
