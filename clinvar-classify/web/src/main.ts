import './style.css';
import { variantsData } from './variantsData';

interface Variant {
  variant: string;
  truth: string;
  bundle: {
    gene_context: string;
    pop_af: string;
    clinvar_summary: string;
    domain: string;
  };
}

const variants: Variant[] = variantsData;

// HTML structure
document.getElementById('app')!.innerHTML = `
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">clinvar-classify v0.1 · live</span>
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
        <h1 class="project-title">clinvar-classify</h1>
        <p class="project-desc">An AI-assisted variant classification research explorer. Browse ClinVar datasets, inspect mock variant classification workflows, and calculate ACMG criteria.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/clinvar-classify.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel" style="padding: 1.25rem; max-height: 580px;">
        <h2 class="panel-title">1. Variants Catalog</h2>
        
        <div class="form-group">
          <input class="form-input" id="search-input" placeholder="Search by gene or mutation..." style="font-size: 0.85rem;" />
        </div>

        <div id="variants-list" style="display: flex; flex-direction: column; gap: 0.4rem; overflow-y: auto; padding-right: 0.25rem; flex: 1;">
          <!-- Variants list populated here -->
        </div>
      </section>

      <section class="glass-panel" id="detail-panel">
        <!-- Variant details loaded dynamically here -->
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
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const variantsList = document.getElementById('variants-list')!;
const detailPanel = document.getElementById('detail-panel')!;

// CLI copy helper
const copyBtn = document.getElementById('copy-cli-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('git clone https://github.com/lcosent/clinvar-classify.git');
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

let activeVariant: Variant = variants[0]!;

function renderList() {
  const query = searchInput.value.toLowerCase();
  const filtered = variants.filter(v => 
    v.variant.toLowerCase().includes(query) || 
    v.truth.toLowerCase().includes(query)
  );

  variantsList.innerHTML = filtered.map(v => {
    const isSelected = v.variant === activeVariant.variant;
    const badgeColor = v.truth === 'PATHOGENIC' ? 'var(--accent-rose)' : v.truth === 'BENIGN' ? 'var(--accent-emerald)' : 'var(--accent-amber)';
    const badgeBg = v.truth === 'PATHOGENIC' ? 'rgba(244, 63, 94, 0.08)' : v.truth === 'BENIGN' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)';

    return `
      <div class="glass-panel" style="padding: 0.6rem 0.8rem; cursor: pointer; border-color: ${isSelected ? 'var(--accent-indigo)' : 'var(--panel-border)'}; background: ${isSelected ? 'rgba(99,102,241,0.08)' : 'var(--panel-bg)'}; gap: 0.25rem;" onclick="window.selectVariant('${v.variant.replace(/'/g, "\\'")}')">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${v.variant}</span>
          <span style="font-size: 0.65rem; border: 1px solid ${badgeColor}; background: ${badgeBg}; color: ${badgeColor}; padding: 0.05rem 0.35rem; border-radius: 4px; font-weight: 700; font-family: var(--font-mono);">${v.truth}</span>
        </div>
      </div>
    `;
  }).join('');
}

function calculateACMGClassification(criteria: {
  pvs1: boolean; ps1: boolean; pm2: boolean; pp3: boolean;
  ba1: boolean; bs1: boolean; bp4: boolean;
}): string {
  let vs = criteria.pvs1 ? 1 : 0;
  let s = criteria.ps1 ? 1 : 0;
  let m = criteria.pm2 ? 1 : 0;
  let p = criteria.pp3 ? 1 : 0;

  let b_stand = criteria.ba1 ? 1 : 0;
  let b_strong = criteria.bs1 ? 1 : 0;
  let b_supp = criteria.bp4 ? 1 : 0;

  if (b_stand >= 1) return 'BENIGN (Stand-alone)';
  if (b_strong >= 2) return 'BENIGN (Strong)';
  if (b_strong >= 1 && b_supp >= 1) return 'LIKELY BENIGN';
  if (b_supp >= 2) return 'LIKELY BENIGN';

  if (vs === 1 && (s >= 1 || m >= 2 || (m === 1 && p === 1) || p >= 2)) return 'PATHOGENIC';
  if (s >= 2) return 'PATHOGENIC';
  if (s === 1 && (m >= 3 || (m === 2 && p >= 2) || (m === 1 && p >= 4))) return 'PATHOGENIC';

  if (vs === 1 && m === 1) return 'LIKELY PATHOGENIC';
  if (s === 1 && (m === 1 || m === 2)) return 'LIKELY PATHOGENIC';
  if (s === 1 && p >= 2) return 'LIKELY PATHOGENIC';
  if (m >= 3) return 'LIKELY PATHOGENIC';
  if (m === 2 && p >= 2) return 'LIKELY PATHOGENIC';
  if (m === 1 && p >= 4) return 'LIKELY PATHOGENIC';

  if ((vs > 0 || s > 0 || m > 0 || p > 0) && (b_stand > 0 || b_strong > 0 || b_supp > 0)) {
    return 'VUS (CONFLICTING)';
  }

  if (vs > 0 || s > 0 || m > 0 || p > 0) {
    return 'VUS (INSUFFICIENT)';
  }

  return 'VUS';
}

function showVariant(v: Variant) {
  activeVariant = v;
  renderList();

  const defaults = {
    pvs1: v.truth === 'PATHOGENIC' && v.bundle.domain.toLowerCase().includes('frameshift'),
    ps1: false,
    pm2: v.bundle.pop_af.toLowerCase().includes('af < 0.00001'),
    pp3: v.truth === 'PATHOGENIC',
    ba1: v.bundle.pop_af.toLowerCase().includes('af = 0.18') || v.bundle.pop_af.toLowerCase().includes('af = 0.034'),
    bs1: v.truth === 'BENIGN',
    bp4: v.truth === 'BENIGN'
  };

  const updateCardResult = () => {
    const criteria = {
      pvs1: (document.getElementById('c-pvs1') as HTMLInputElement).checked,
      ps1: (document.getElementById('c-ps1') as HTMLInputElement).checked,
      pm2: (document.getElementById('c-pm2') as HTMLInputElement).checked,
      pp3: (document.getElementById('c-pp3') as HTMLInputElement).checked,
      ba1: (document.getElementById('c-ba1') as HTMLInputElement).checked,
      bs1: (document.getElementById('c-bs1') as HTMLInputElement).checked,
      bp4: (document.getElementById('c-bp4') as HTMLInputElement).checked,
    };

    const classification = calculateACMGClassification(criteria);
    const classificationBadge = document.getElementById('calc-class')!;
    classificationBadge.innerText = classification;

    if (classification.includes('PATHOGENIC')) {
      classificationBadge.style.color = 'var(--accent-rose)';
      classificationBadge.style.borderColor = 'var(--accent-rose)';
      classificationBadge.style.background = 'rgba(244, 63, 94, 0.08)';
    } else if (classification.includes('BENIGN')) {
      classificationBadge.style.color = 'var(--accent-emerald)';
      classificationBadge.style.borderColor = 'var(--accent-emerald)';
      classificationBadge.style.background = 'rgba(16, 185, 129, 0.08)';
    } else {
      classificationBadge.style.color = 'var(--accent-amber)';
      classificationBadge.style.borderColor = 'var(--accent-amber)';
      classificationBadge.style.background = 'rgba(245, 158, 11, 0.08)';
    }
  };

  const popAf = v.bundle.pop_af.toLowerCase();
  const isRare = popAf.includes('af < 0.00001') || popAf.includes('absent');
  const frequencyLabel = isRare ? 'Extremely Rare (High Risk)' : 'Common Allele (Low Risk)';
  const frequencyColor = isRare ? 'var(--accent-rose)' : 'var(--accent-emerald)';
  const frequencyBg = isRare ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)';

  detailPanel.innerHTML = `
    <h2 class="panel-title">2. Clinical Case File: ${v.variant}</h2>
    
    <div class="grid-2col" style="gap: 0.75rem; font-size: 0.8rem;">
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Gene Target</span><br/>
        <span style="color: var(--text-primary); font-weight: 600;">${v.bundle.gene_context}</span>
      </div>
      <div style="background: ${frequencyBg}; border: 1px solid ${frequencyColor}; padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Population Frequency</span><br/>
        <span style="color: ${frequencyColor}; font-weight: 700;">${v.bundle.pop_af} (${frequencyLabel})</span>
      </div>
    </div>

    <div class="grid-2col" style="gap: 0.75rem; font-size: 0.8rem;">
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">ClinVar Database</span><br/>
        <span style="color: var(--text-primary); font-weight: 500;">${v.bundle.clinvar_summary}</span>
      </div>
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Functional Domain Impact</span><br/>
        <span style="color: var(--text-primary); font-weight: 500;">${v.bundle.domain}</span>
      </div>
    </div>

    <div style="border-top: 1px solid var(--panel-border); padding-top: 0.85rem; margin-top: 0.25rem;">
      <h4 style="font-family: var(--font-header); font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.5rem;">ACMG Classification Rules Grid</h4>
      
      <div class="grid-2col" style="font-size: 0.8rem;">
        <div>
          <span style="font-weight: 700; color: var(--accent-rose); display: block; margin-bottom: 0.35rem; font-size: 0.75rem; text-transform: uppercase;">Pathogenic Criteria</span>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-pvs1" ${defaults.pvs1 ? 'checked' : ''} />
              <span>PVS1 (Strong Null Variant)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-ps1" ${defaults.ps1 ? 'checked' : ''} />
              <span>PS1 (Strong Amino Acid Match)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-pm2" ${defaults.pm2 ? 'checked' : ''} />
              <span>PM2 (Moderate Pop Absent)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-pp3" ${defaults.pp3 ? 'checked' : ''} />
              <span>PP3 (Supporting Predictor)</span>
            </label>
          </div>
        </div>

        <div>
          <span style="font-weight: 700; color: var(--accent-emerald); display: block; margin-bottom: 0.35rem; font-size: 0.75rem; text-transform: uppercase;">Benign Criteria</span>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-ba1" ${defaults.ba1 ? 'checked' : ''} />
              <span>BA1 (Stand-alone Frequency > 5%)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-bs1" ${defaults.bs1 ? 'checked' : ''} />
              <span>BS1 (Strong High Frequency)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-bp4" ${defaults.bp4 ? 'checked' : ''} />
              <span>BP4 (Supporting Comput. Neutral)</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ACMG Rule Description (Dev Mode Only) -->
    <div class="dev-mode-only form-group" style="border-top: 1px solid var(--panel-border); padding-top: 0.75rem; margin-top: 0.5rem;">
      <span class="form-label" style="font-size: 0.7rem;">ACMG Rules Logic Console</span>
      <div class="terminal-output" style="font-size: 0.7rem; min-height: 60px; padding: 0.5rem; font-family: var(--font-mono);">
        Pathogenic: (PVS1 & PS1) || (PVS1 & >=2 PM2) || (PS1 & >=3 PM2)<br/>
        Benign: BA1 Stand-alone || >=2 BS1 Strong
      </div>
    </div>

    <div style="border-top: 1px solid var(--panel-border); padding-top: 0.85rem; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-family: var(--font-header); font-weight: 600; font-size: 0.95rem;">ACMG Calculated Verdict</span>
      <span id="calc-class" style="font-size: 0.8rem; font-weight: 700; border: 1px solid var(--panel-border); padding: 0.25rem 0.75rem; border-radius: 6px; letter-spacing: 0.03em; font-family: var(--font-mono);">VUS</span>
    </div>
  `;

  // Attach event listeners to checkboxes
  ['c-pvs1', 'c-ps1', 'c-pm2', 'c-pp3', 'c-ba1', 'c-bs1', 'c-bp4'].forEach(id => {
    document.getElementById(id)!.addEventListener('change', updateCardResult);
  });

  updateCardResult();
}

// Global binding for onclick selection
(window as any).selectVariant = (variantName: string) => {
  const match = variants.find(v => v.variant === variantName);
  if (match) {
    showVariant(match);
  }
};

searchInput.addEventListener('input', renderList);

// Initialize
showVariant(activeVariant);

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
