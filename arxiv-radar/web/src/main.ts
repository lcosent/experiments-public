import './style.css';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Paper {
  x: number;
  y: number;
  title: string;
  category: string;
  abstract: string;
  trend: string;
  trendDir: 'up' | 'down';
  trendValue: number;
}

const mockPapers: Paper[] = [
  {
    x: 1.2, y: 3.4,
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
    category: "Alignment & RLHF",
    abstract: "A simple alternative to RLHF that optimizes the policy directly from preference data without training a separate reward model.",
    trend: "+24% momentum", trendDir: 'up', trendValue: 24
  },
  {
    x: 1.5, y: 3.1,
    title: "KTO: Model Alignment as Prospect Theory",
    category: "Alignment & RLHF",
    abstract: "Aligns models directly from binary signal (good/bad outputs) using insights from behavioral economics.",
    trend: "+12% momentum", trendDir: 'up', trendValue: 12
  },
  {
    x: 4.1, y: -2.3,
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    category: "Fine-Tuning & PEFT",
    abstract: "Reduces fine-tuning memory footprints by parameterizing weight updates with low-rank decomposition matrices.",
    trend: "+38% momentum", trendDir: 'up', trendValue: 38
  },
  {
    x: 4.5, y: -2.0,
    title: "QLoRA: Efficient Finetuning of Quantized LLMs",
    category: "Fine-Tuning & PEFT",
    abstract: "Enables 4-bit model fine-tuning on a single 24GB GPU without sacrificing score quality.",
    trend: "+41% momentum", trendDir: 'up', trendValue: 41
  },
  {
    x: -3.2, y: 1.2,
    title: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
    category: "Multi-Agent Systems",
    abstract: "A framework for designing multi-agent conversation systems that solve complex workflows collaboratively.",
    trend: "+65% momentum", trendDir: 'up', trendValue: 65
  },
  {
    x: -2.9, y: 1.5,
    title: "ChatDev: Communicative Agents for Software Development",
    category: "Multi-Agent Systems",
    abstract: "Uses agent conversations in virtual software companies (CEO, CPO, coder, tester) to automate development cycles.",
    trend: "+48% momentum", trendDir: 'up', trendValue: 48
  },
  {
    x: 0.1, y: -4.2,
    title: "Attention Is All You Need",
    category: "Foundations & Transformers",
    abstract: "Introduces the Transformer architecture based entirely on self-attention mechanisms, replacing recurrence.",
    trend: "-5% stable", trendDir: 'down', trendValue: 5
  },
  {
    x: -0.2, y: -4.5,
    title: "Roformer: Enhanced Transformer with Rotary Position Embedding",
    category: "Foundations & Transformers",
    abstract: "Introduces Rotary Position Embeddings (RoPE) to capture long-range token relationships dynamically.",
    trend: "+8% momentum", trendDir: 'up', trendValue: 8
  }
];

// HTML Layout
document.getElementById('app')!.innerHTML = `
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">arxiv-radar v0.1 · live</span>
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
        <h1 class="project-title">arxiv-radar</h1>
        <p class="project-desc">A thematic clustering radar of arXiv publication trends. Identify emerging research nodes and vector trends from embedded paper clusters.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/experiments-public.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel" style="min-height: 400px;">
        <h2 class="panel-title">1. Theme Cluster Map</h2>
        
        <!-- Interactive Category Hub -->
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span class="form-label" style="font-size: 0.7rem;">Filter Cluster Topics</span>
          <div id="category-pills" style="display: flex; gap: 0.5rem; flex-wrap: wrap;"></div>
        </div>

        <div style="position: relative; width: 100%; height: 280px; background: rgba(0,0,0,0.1); border-radius: 6px; border: 1px solid var(--panel-border);">
          <canvas id="radar-chart"></canvas>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 0.25rem;">
          Hover over nodes to inspect publication details and vector momentum.
        </p>
      </section>

      <section class="glass-panel" id="paper-card" style="justify-content: flex-start;">
        <h2 class="panel-title">2. Paper Spotlight</h2>
        
        <div id="card-placeholder" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-style: italic; min-height: 200px; text-align: center;">
          Hover over any node on the vector map to load paper metadata.
        </div>
        
        <div id="card-content" style="display: none; flex-direction: column; gap: 0.85rem; height: 100%;">
          <div>
            <span id="paper-category" style="font-size: 0.7rem; border-radius: 4px; padding: 0.15rem 0.5rem; border: 1px solid var(--accent-indigo); color: var(--accent-indigo); background: rgba(99,102,241,0.08); font-weight: 600; font-family: var(--font-mono);"></span>
            <span id="paper-trend" style="font-size: 0.7rem; border-radius: 4px; padding: 0.15rem 0.5rem; margin-left: 0.4rem; font-weight: 600; font-family: var(--font-mono);"></span>
          </div>
          
          <h3 id="paper-title" style="font-family: var(--font-header); font-size: 1.25rem; font-weight: 700; line-height: 1.3; color: var(--text-primary);"></h3>
          <p id="paper-abstract" style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 300; line-height: 1.5;"></p>

          <!-- Vector math panel (Dev Mode Only) -->
          <div class="dev-mode-only form-group" style="border-top: 1px solid var(--panel-border); padding-top: 0.75rem; margin-top: auto;">
            <span class="form-label" style="font-size: 0.7rem;">Vector Projection Coordinates</span>
            <div class="terminal-output" style="font-size: 0.75rem; min-height: 50px; padding: 0.5rem; font-family: var(--font-mono);" id="vector-coords"></div>
          </div>
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

// DOM Handles
const devModeToggle = document.getElementById('dev-mode-toggle') as HTMLInputElement;
const cardPlaceholder = document.getElementById('card-placeholder')!;
const cardContent = document.getElementById('card-content')!;
const paperCategory = document.getElementById('paper-category')!;
const paperTrend = document.getElementById('paper-trend')!;
const paperTitle = document.getElementById('paper-title')!;
const paperAbstract = document.getElementById('paper-abstract')!;
const vectorCoords = document.getElementById('vector-coords')!;
const chartCanvas = document.getElementById('radar-chart') as HTMLCanvasElement;
const categoryPillsContainer = document.getElementById('category-pills')!;

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

// Dev Mode Listener
devModeToggle.addEventListener('change', () => {
  if (devModeToggle.checked) {
    document.body.classList.add('dev-mode-active');
  } else {
    document.body.classList.remove('dev-mode-active');
  }
});

function showPaper(paper: Paper) {
  cardPlaceholder.style.display = 'none';
  cardContent.style.display = 'flex';

  paperTitle.innerText = paper.title;
  paperAbstract.innerText = paper.abstract;
  paperCategory.innerText = paper.category;
  vectorCoords.innerText = `UMAP Dimension 1 (X): ${paper.x.toFixed(3)}\nUMAP Dimension 2 (Y): ${paper.y.toFixed(3)}\nMomentum Weight: ${paper.trendValue}%`;
  
  paperTrend.innerText = paper.trend;
  if (paper.trendDir === 'up') {
    paperTrend.style.borderColor = 'var(--accent-emerald)';
    paperTrend.style.color = 'var(--accent-emerald)';
    paperTrend.style.background = 'rgba(16, 185, 129, 0.08)';
  } else {
    paperTrend.style.borderColor = 'var(--accent-rose)';
    paperTrend.style.color = 'var(--accent-rose)';
    paperTrend.style.background = 'rgba(244, 63, 94, 0.08)';
  }
}

// Build list of unique categories
const categories = Array.from(new Set(mockPapers.map(p => p.category)));
const activeCategories = new Set<string>(categories);

const colors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b'];
let chartInstance: Chart | null = null;

function renderChart() {
  const datasets = categories.map((cat, idx) => {
    const isVisible = activeCategories.has(cat);
    const catPapers = mockPapers.filter(p => p.category === cat);
    return {
      label: cat,
      data: isVisible ? catPapers.map(p => ({ x: p.x, y: p.y, paper: p })) : [],
      backgroundColor: colors[idx % colors.length],
      pointHoverRadius: 8,
      pointRadius: 6,
      borderWidth: 0
    };
  });

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      onHover: (_event, chartElements) => {
        if (chartElements.length > 0) {
          const datasetIdx = chartElements[0].datasetIndex;
          const index = chartElements[0].index;
          const rawPoint = chartInstance!.data.datasets[datasetIdx]!.data[index] as any;
          if (rawPoint && rawPoint.paper) {
            showPaper(rawPoint.paper);
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { display: false }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { display: false }
        }
      }
    }
  });
}

function renderPills() {
  categoryPillsContainer.innerHTML = '';
  categories.forEach((cat, idx) => {
    const isActive = activeCategories.has(cat);
    const pill = document.createElement('button');
    pill.className = `btn btn-secondary`;
    pill.style.fontSize = '0.75rem';
    pill.style.padding = '0.3rem 0.6rem';
    pill.style.borderRadius = '16px';
    pill.style.border = `1px solid ${colors[idx % colors.length]}`;
    
    if (isActive) {
      pill.style.background = colors[idx % colors.length]!;
      pill.style.color = '#fff';
    } else {
      pill.style.background = 'transparent';
      pill.style.color = colors[idx % colors.length]!;
      pill.style.opacity = '0.5';
    }

    pill.innerText = cat;
    pill.addEventListener('click', () => {
      if (activeCategories.has(cat)) {
        if (activeCategories.size > 1) {
          activeCategories.delete(cat);
        }
      } else {
        activeCategories.add(cat);
      }
      renderPills();
      renderChart();
    });

    categoryPillsContainer.appendChild(pill);
  });
}

// Initial renders
renderPills();
renderChart();

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
