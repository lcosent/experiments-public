import './style.css';
import { Chart, registerables } from 'chart.js';
import { wilcoxonSignedRankTest } from './stats';

Chart.register(...registerables);

const defaultPromptA = `You are a helpful, empathetic customer service agent.
Analyze the user's issue, validate their feelings, and offer a detailed multi-step resolution.
Be polite and use conversational language.`;

const defaultPromptB = `You are a highly concise customer support specialist.
Identify the user's core problem immediately and provide a single-sentence direct solution.
Do not use conversational fluff. Max 40 words.`;

// HTML Structure
document.getElementById('app')!.innerHTML = `
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">prompt-eval-arena v0.1 · live</span>
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
        <h1 class="project-title">prompt-eval-arena</h1>
        <p class="project-desc">A statistical A/B testing harness for LLM prompts. Compare prompt variants, run simulated user trials, and evaluate performance using Wilcoxon Signed-Rank tests.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/prompt-eval-arena.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel">
        <h2 class="panel-title">1. Prompt Settings</h2>
        
        <div class="form-group">
          <label class="form-label">Prompt A (Baseline)</label>
          <textarea class="form-textarea" id="prompt-a" style="font-family: var(--font-mono); font-size: 0.8rem; min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Prompt B (Challenger)</label>
          <textarea class="form-textarea" id="prompt-b" style="font-family: var(--font-mono); font-size: 0.8rem; min-height: 80px;"></textarea>
        </div>

        <!-- Standard Mode Controls -->
        <div class="form-group standard-control-group">
          <label class="form-label">Test Intensity (Replicate Runs: <span id="intensity-val">50</span>)</label>
          <input type="range" class="range-slider" id="sim-intensity" min="20" max="150" value="50" />
        </div>

        <div class="form-group standard-control-group">
          <label class="form-label">Simulated Challenger Edge: <span id="advantage-val">+10%</span></label>
          <input type="range" class="range-slider" id="challenger-advantage" min="-30" max="30" step="5" value="10" />
        </div>

        <!-- Developer Mode Form Fields (Hidden by default) -->
        <div class="dev-mode-only form-group" style="border-top: 1px solid var(--panel-border); padding-top: 1rem; gap: 1rem;">
          <div class="grid-2col">
            <div class="form-group">
              <label class="form-label">Sample Size (Runs)</label>
              <input class="form-input" type="number" id="sample-size" value="50" min="10" max="200" />
            </div>
            <div class="form-group">
              <label class="form-label">Grader Scale Max</label>
              <input class="form-input" type="number" id="scale-max" value="5" min="5" max="100" />
            </div>
          </div>

          <div class="grid-2col">
            <div class="form-group">
              <label class="form-label">A Expected Score</label>
              <input class="form-input" type="number" id="mean-a" value="4.0" step="0.1" />
            </div>
            <div class="form-group">
              <label class="form-label">B Expected Score</label>
              <input class="form-input" type="number" id="mean-b" value="4.4" step="0.1" />
            </div>
          </div>
        </div>

        <button class="btn" id="run-test-btn">Run Statistical A/B Test</button>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Evaluation Scorecard</h2>
        
        <div id="sig-badge-container" style="display: flex; justify-content: center; margin-bottom: 0.25rem;">
          <!-- Sig badge populated here -->
        </div>

        <!-- Simplified Visual Journey Indicators -->
        <div class="report-card" id="visual-report" style="background: rgba(99, 102, 241, 0.04); border-color: rgba(99, 102, 241, 0.25);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Comparison Outcome</span>
            <span id="visual-outcome-badge" style="font-weight: 700; font-size: 0.9rem; text-transform: uppercase;"></span>
          </div>
          
          <div style="margin: 0.5rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
              <span>Confidence Level</span>
              <span id="visual-confidence-val">95%</span>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
              <div id="visual-confidence-bar" style="height: 100%; width: 95%; background: var(--accent-indigo); transition: width 0.3s ease;"></div>
            </div>
          </div>
          
          <p id="visual-summary-text" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; margin-top: 0.25rem;"></p>
        </div>

        <div style="position: relative; width: 100%; height: 180px;">
          <canvas id="prompt-chart"></canvas>
        </div>

        <!-- Developer Mode Detailed Metrics -->
        <div class="dev-mode-only form-group" id="stats-summary-box" style="font-size: 0.85rem; margin-top: 0.5rem;">
          <!-- Table summary populated here -->
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
const promptAInput = document.getElementById('prompt-a') as HTMLTextAreaElement;
const promptBInput = document.getElementById('prompt-b') as HTMLTextAreaElement;
const sampleSizeInput = document.getElementById('sample-size') as HTMLInputElement;
const scaleMaxInput = document.getElementById('scale-max') as HTMLInputElement;
const meanAInput = document.getElementById('mean-a') as HTMLInputElement;
const meanBInput = document.getElementById('mean-b') as HTMLInputElement;
const simIntensity = document.getElementById('sim-intensity') as HTMLInputElement;
const intensityVal = document.getElementById('intensity-val')!;
const challengerAdvantage = document.getElementById('challenger-advantage') as HTMLInputElement;
const advantageVal = document.getElementById('advantage-val')!;
const runBtn = document.getElementById('run-test-btn') as HTMLButtonElement;
const sigBadgeContainer = document.getElementById('sig-badge-container')!;
const visualOutcomeBadge = document.getElementById('visual-outcome-badge')!;
const visualConfidenceVal = document.getElementById('visual-confidence-val')!;
const visualConfidenceBar = document.getElementById('visual-confidence-bar') as HTMLDivElement;
const visualSummaryText = document.getElementById('visual-summary-text')!;
const statsSummaryBox = document.getElementById('stats-summary-box')!;
const chartCanvas = document.getElementById('prompt-chart') as HTMLCanvasElement;

// CLI Widget Copy
const copyBtn = document.getElementById('copy-cli-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('git clone https://github.com/lcosent/prompt-eval-arena.git');
    copyBtn.innerText = 'Copied!';
    setTimeout(() => {
      copyBtn.innerText = 'Copy';
    }, 2000);
  });
}

promptAInput.value = defaultPromptA;
promptBInput.value = defaultPromptB;

// Sync Slider Interactions
simIntensity.addEventListener('input', () => {
  intensityVal.innerText = simIntensity.value;
  sampleSizeInput.value = simIntensity.value;
});

challengerAdvantage.addEventListener('input', () => {
  const percent = parseInt(challengerAdvantage.value);
  advantageVal.innerText = percent >= 0 ? `+${percent}%` : `${percent}%`;
  
  // A is 4.0 baseline on 1-5 scale. Change B expected score
  const improvement = percent / 100;
  const newMeanB = 4.0 * (1 + improvement);
  meanBInput.value = Math.max(1.0, Math.min(5.0, newMeanB)).toFixed(1);
});

// Dev Mode Listener
devModeToggle.addEventListener('change', () => {
  if (devModeToggle.checked) {
    document.body.classList.add('dev-mode-active');
  } else {
    document.body.classList.remove('dev-mode-active');
  }
});

let chartInstance: Chart | null = null;

// Normal distribution sample generator (Box-Muller)
function randomNormal(mean: number, std: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function runABTest() {
  const size = parseInt(sampleSizeInput.value);
  const maxScale = parseFloat(scaleMaxInput.value);
  const meanA = parseFloat(meanAInput.value);
  const meanB = parseFloat(meanBInput.value);

  // Generate scores for A and B based on normal dist (clamped to scale)
  const scoresA: number[] = [];
  const scoresB: number[] = [];

  for (let i = 0; i < size; i++) {
    const rawA = randomNormal(meanA, 0.6);
    const rawB = randomNormal(meanB, 0.7);
    scoresA.push(Math.round(Math.max(1, Math.min(maxScale, rawA)) * 10) / 10);
    scoresB.push(Math.round(Math.max(1, Math.min(maxScale, rawB)) * 10) / 10);
  }

  // Calculate statistics
  const stats = wilcoxonSignedRankTest(scoresA, scoresB);

  // Calculate user-friendly confidence
  const rawP = stats.pValue;
  const confidencePct = Math.round((1 - rawP) * 100);
  
  visualConfidenceVal.innerText = `${confidencePct}%`;
  visualConfidenceBar.style.width = `${confidencePct}%`;
  
  if (stats.significant) {
    const isBWinner = meanB > meanA;
    const winnerName = isBWinner ? 'Prompt B (Challenger)' : 'Prompt A (Baseline)';
    const winnerColor = isBWinner ? 'var(--accent-rose)' : 'var(--accent-indigo)';
    const textDesc = isBWinner 
      ? `Challenger prompt (${winnerName}) out-performs baseline with high statistical confidence. Recommended cutover.`
      : `Baseline prompt (${winnerName}) remains superior with high confidence. Do not deploy challenger.`;
    
    visualOutcomeBadge.innerText = isBWinner ? 'B Superior' : 'A Superior';
    visualOutcomeBadge.style.color = winnerColor;
    visualSummaryText.innerText = textDesc;

    sigBadgeContainer.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid var(--accent-emerald); color: var(--accent-emerald); font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; text-align: center; width: 100%;">
        SIGNIFICANT DIFFERENCE (p = ${stats.pValue}, Effect Size d = ${stats.effectSize})
      </div>
    `;
  } else {
    visualOutcomeBadge.innerText = 'Inconclusive';
    visualOutcomeBadge.style.color = 'var(--accent-amber)';
    visualSummaryText.innerText = 'The difference in grades is not statistically significant. The challenger did not demonstrate a clear benefit over the baseline.';

    sigBadgeContainer.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid var(--accent-amber); color: var(--accent-amber); font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; text-align: center; width: 100%;">
        NOT SIGNIFICANT (p = ${stats.pValue})
      </div>
    `;
  }

  // Render summary table
  statsSummaryBox.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="border-bottom: 1px solid var(--panel-border); color: var(--text-secondary); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">
          <th style="padding: 0.5rem 0;">Metric</th>
          <th style="padding: 0.5rem 0; text-align: right;">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--panel-border);">
          <td style="padding: 0.5rem 0;">Sample size (Replicates)</td>
          <td style="padding: 0.5rem 0; text-align: right; font-weight: 600;">${size}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--panel-border);">
          <td style="padding: 0.5rem 0;">Wilcoxon W Statistic</td>
          <td style="padding: 0.5rem 0; text-align: right; font-weight: 600;">${stats.wStatistic}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--panel-border);">
          <td style="padding: 0.5rem 0;">Approximate Z-Score</td>
          <td style="padding: 0.5rem 0; text-align: right; font-weight: 600;">${stats.zScore}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--panel-border);">
          <td style="padding: 0.5rem 0;">Cohen's d (Effect Size)</td>
          <td style="padding: 0.5rem 0; text-align: right; font-weight: 600; color: var(--accent-indigo);">${stats.effectSize}</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--panel-border);">
          <td style="padding: 0.5rem 0;">P-Value (Two-Tailed)</td>
          <td style="padding: 0.5rem 0; text-align: right; font-weight: 700; color: ${stats.significant ? 'var(--accent-emerald)' : 'var(--text-primary)'};">${stats.pValue}</td>
        </tr>
      </tbody>
    </table>
  `;

  // Render chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const runLabels = Array.from({ length: size }, (_, i) => `Run ${i + 1}`);

  chartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: runLabels,
      datasets: [
        {
          label: 'Prompt A (Baseline)',
          data: scoresA,
          borderColor: 'rgba(99, 102, 241, 0.85)',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.15
        },
        {
          label: 'Prompt B (Challenger)',
          data: scoresB,
          borderColor: 'rgba(244, 63, 94, 0.85)',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.15
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#f8fafc', font: { family: 'Inter', size: 11 } }
        }
      },
      scales: {
        x: {
          display: false,
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          min: 0,
          max: maxScale,
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
        }
      }
    }
  });
}

runBtn.addEventListener('click', runABTest);
runABTest();


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
