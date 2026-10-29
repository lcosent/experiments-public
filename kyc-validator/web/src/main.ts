import './style.css';

const mockDocuments: Record<string, { docType: string; name: string; dob: string; number: string; country: string; status: string; statusColor: string; mrz: string; score: string; logs: string[] }> = {
  valid_passport: {
    docType: "Passport",
    name: "ALICE SMITH",
    dob: "1988-11-12",
    number: "N472819382",
    country: "US",
    status: "VERIFIED",
    statusColor: "var(--accent-emerald)",
    mrz: "P<USA<<SMITH<<ALICE<<<<<<<<<<<<<<<<<<<<<<<",
    score: "98/100",
    logs: [
      "[SYSTEM] Initializing on-device WebAssembly OCR parser...",
      "[OCR] Document structure matches US Passport V3 layout.",
      "[OCR] MRZ (Machine Readable Zone) decoded successfully.",
      "[OCR] Extracted: Name='ALICE SMITH' DOB='1988-11-12' ID='N472819382' Country='US'.",
      "[SCREENING] Querying local OFAC SDN index...",
      "[SCREENING] Querying local PEP (Politically Exposed Person) registry...",
      "[SCREENING] Watchlist matches: 0 hits (Confidence > 95%).",
      "[VERIFICATION] Verification score: 98/100 (Pass).",
      "[SUCCESS] KYC validation complete. Transaction authorized."
    ]
  },
  flagged_person: {
    docType: "Driver's License",
    name: "VLADIMIR IVANOV",
    dob: "1972-04-20",
    number: "DL78291038",
    country: "RU",
    status: "DENIED - OFAC HIT",
    statusColor: "var(--accent-rose)",
    mrz: "I<RUS<<IVANOV<<VLADIMIR<<<<<<<<<<<<<<<<<<<<<",
    score: "12/100",
    logs: [
      "[SYSTEM] Initializing on-device WebAssembly OCR parser...",
      "[OCR] Document structure matches RU Driver License layout.",
      "[OCR] OCR Text recognition confidence: 91%.",
      "[OCR] Extracted: Name='VLADIMIR IVANOV' DOB='1972-04-20' ID='DL78291038' Country='RU'.",
      "[SCREENING] Querying local OFAC SDN index...",
      "[WARNING] OFAC screening hit! Found match: 'VLADIMIR IVANOV', DOB='1972-04-20', Status='SDN Entity'.",
      "[SCREENING] Querying local PEP registry...",
      "[PEP] PEP match: 1 hit (State Owned Enterprise executive).",
      "[VERIFICATION] Verification score: 12/100 (Fail).",
      "[ERROR] Match detected on OFAC SDN List. Transaction frozen, compliance report generated."
    ]
  },
  invalid_document: {
    docType: "Utility Bill",
    name: "JOHN DOE",
    dob: "N/A",
    number: "BILL-8927182",
    country: "CA",
    status: "FAILED - EXPIRED/BLURRY",
    statusColor: "var(--accent-rose)",
    mrz: "MRZ NOT SUPPORTED ON UTILITY DOCUMENTS",
    score: "45/100",
    logs: [
      "[SYSTEM] Initializing on-device WebAssembly OCR parser...",
      "[OCR] Document structure matches Canadian Utility Bill layout.",
      "[OCR] Extracting address proof criteria...",
      "[OCR] Extracted: Name='JOHN DOE' Date='2025-10-15' Issuer='Hydro-Quebec'.",
      "[WARNING] Document issue date is older than 90 days (Expired).",
      "[SCREENING] Sourcing secondary proof of residency...",
      "[VERIFICATION] Verification score: 45/100 (Fail).",
      "[ERROR] Address proof expired. Rejecting proof of address document."
    ]
  }
};

// HTML Layout
document.getElementById('app')!.innerHTML = `
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">kyc-validator v0.1 · live</span>
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
        <h1 class="project-title">kyc-validator</h1>
        <p class="project-desc">A local-only client-side KYC validation and sanctions screening sandbox. Simulated on-device document OCR parsing and OFAC watchlist screening.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/experiments-public.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel">
        <h2 class="panel-title">1. Document Input</h2>
        
        <div class="form-group">
          <label class="form-label">Simulated ID Document</label>
          <select class="form-select" id="doc-select">
            <option value="valid_passport">US Passport (Alice Smith) - Valid</option>
            <option value="flagged_person">RU Driver License (Vladimir Ivanov) - OFAC Flagged</option>
            <option value="invalid_document">Utility Bill (John Doe) - Expired Proof</option>
          </select>
        </div>

        <div style="background: rgba(255, 255, 255, 0.02); border: 2px dashed var(--panel-border); border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.2s ease;" id="dropzone">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📄</div>
          <div style="font-weight: 500; font-size: 0.9rem; color: var(--text-secondary);" id="dropzone-text">US_Passport_Alice_Smith.jpg</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Click to scan simulated document</div>
        </div>

        <!-- Standard Mode ID Display (Visual ID) -->
        <div class="mock-id-card-container" id="mock-id-card" style="position: relative; overflow: hidden; background: rgba(13, 17, 30, 0.9); border: 1px solid var(--panel-border); border-radius: 8px; width: 100%; height: 170px; display: flex; flex-direction: column; justify-content: center; padding: 1.25rem; gap: 0.5rem; transition: border-color 0.3s ease;">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div style="width: 50px; height: 60px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--panel-border); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;" id="id-photo">👤</div>
            <div style="display: flex; flex-direction: column; gap: 0.15rem; flex: 1;">
              <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; font-family: var(--font-mono); font-weight: 700;" id="id-doc-label">PASSPORT</div>
              <div style="font-weight: 700; font-size: 1.05rem;" id="id-name">ALICE SMITH</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);" id="id-dob">DOB: 1988-11-12</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);" id="id-no">No: N472819382</div>
            </div>
          </div>
          <div style="border-top: 1px dashed var(--panel-border); margin-top: 0.25rem; padding-top: 0.4rem; font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); letter-spacing: 1.5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" id="id-mrz">
            P&lt;USA&lt;&lt;SMITH&lt;&lt;ALICE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </div>
          <!-- Scanning Laser Bar -->
          <div id="scanner-laser" style="position: absolute; left: 0; top: 0; width: 100%; height: 2px; background: var(--accent-indigo); box-shadow: 0 0 8px var(--accent-indigo); display: none; transition: top 0.05s linear;"></div>
        </div>

        <button class="btn" id="run-kyc-btn">Execute Local KYC Verification</button>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Verification Summary</h2>
        
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--panel-border); padding: 0.6rem 0.8rem; border-radius: 6px; margin-bottom: 0.25rem;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">KYC Status</span>
          <span style="font-weight: 700; font-size: 0.95rem; letter-spacing: 0.05em; color: var(--text-secondary);" id="kyc-status">READY</span>
        </div>

        <!-- Standard Visual Checklist -->
        <div class="report-card" id="visual-checklist" style="display: flex; flex-direction: column; gap: 0.5rem; background: rgba(99, 102, 241, 0.02); border-color: var(--panel-border); padding: 0.85rem 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.25rem; font-weight: 600;">
            <span>On-Device Verification Pipeline</span>
            <span id="visual-score" style="color: var(--accent-indigo);">Pending</span>
          </div>
          <div class="checklist-item" id="check-ocr" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
            <span class="check-icon" style="font-family: var(--font-mono); font-weight: 700; width: 16px;">○</span> <span>Document OCR extraction</span>
          </div>
          <div class="checklist-item" id="check-watchlist" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
            <span class="check-icon" style="font-family: var(--font-mono); font-weight: 700; width: 16px;">○</span> <span>Watchlist (OFAC) screening</span>
          </div>
          <div class="checklist-item" id="check-pep" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
            <span class="check-icon" style="font-family: var(--font-mono); font-weight: 700; width: 16px;">○</span> <span>PEP Database Lookup</span>
          </div>
        </div>

        <!-- Dev Mode Terminal Logs -->
        <div class="dev-mode-only form-group" style="margin-top: 0.25rem;">
          <label class="form-label">WASM Terminal Logs</label>
          <div class="terminal-output" id="kyc-terminal" style="font-size: 0.75rem; min-height: 140px; padding: 0.75rem;">
            <div class="terminal-line info">Ready to verify. Select a document and click "Execute Local KYC Verification".</div>
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

// Handles
const devModeToggle = document.getElementById('dev-mode-toggle') as HTMLInputElement;
const docSelect = document.getElementById('doc-select') as HTMLSelectElement;
const dropzone = document.getElementById('dropzone')!;
const dropzoneText = document.getElementById('dropzone-text')!;
const runBtn = document.getElementById('run-kyc-btn') as HTMLButtonElement;
const kycStatus = document.getElementById('kyc-status')!;
const kycTerminal = document.getElementById('kyc-terminal')!;
const scannerLaser = document.getElementById('scanner-laser') as HTMLDivElement;
const mockIdCard = document.getElementById('mock-id-card') as HTMLDivElement;

const idPhoto = document.getElementById('id-photo')!;
const idDocLabel = document.getElementById('id-doc-label')!;
const idName = document.getElementById('id-name')!;
const idDob = document.getElementById('id-dob')!;
const idNo = document.getElementById('id-no')!;
const idMrz = document.getElementById('id-mrz')!;

const checkOcr = document.getElementById('check-ocr')!;
const checkWatchlist = document.getElementById('check-watchlist')!;
const checkPep = document.getElementById('check-pep')!;
const visualScore = document.getElementById('visual-score')!;

// CLI widget Copy
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

function updateDocDisplay() {
  const selected = docSelect.value;
  const doc = mockDocuments[selected]!;
  
  if (selected === 'valid_passport') {
    dropzoneText.innerText = "US_Passport_Alice_Smith.jpg";
    idPhoto.innerText = "👩";
  } else if (selected === 'flagged_person') {
    dropzoneText.innerText = "RU_Driver_License_Vladimir_Ivanov.png";
    idPhoto.innerText = "👨";
  } else {
    dropzoneText.innerText = "Hydro_Quebec_Utility_John_Doe.pdf";
    idPhoto.innerText = "📄";
  }

  idDocLabel.innerText = doc.docType;
  idName.innerText = doc.name;
  idDob.innerText = `DOB: ${doc.dob}`;
  idNo.innerText = `No: ${doc.number}`;
  idMrz.innerText = doc.mrz;

  // Reset checklist UI
  checkOcr.style.color = "var(--text-secondary)";
  checkOcr.querySelector('.check-icon')!.innerHTML = "○";
  checkWatchlist.style.color = "var(--text-secondary)";
  checkWatchlist.querySelector('.check-icon')!.innerHTML = "○";
  checkPep.style.color = "var(--text-secondary)";
  checkPep.querySelector('.check-icon')!.innerHTML = "○";

  visualScore.innerText = "Pending";
  visualScore.style.color = "var(--accent-indigo)";

  kycStatus.innerText = "READY";
  kycStatus.style.color = "var(--text-secondary)";
  kycTerminal.innerHTML = `<div class="terminal-line info">Ready. Selected new document profile.</div>`;
  
  mockIdCard.style.borderColor = "var(--panel-border)";
  scannerLaser.style.display = "none";
}

docSelect.addEventListener('change', updateDocDisplay);
updateDocDisplay();

let verifying = false;

async function executeKYC() {
  if (verifying) return;
  verifying = true;
  runBtn.disabled = true;
  kycTerminal.innerHTML = '';
  kycStatus.innerText = "SCANNING...";
  kycStatus.style.color = "var(--accent-indigo)";

  const selected = docSelect.value;
  const doc = mockDocuments[selected]!;

  // Trigger laser scan animation
  scannerLaser.style.display = "block";
  scannerLaser.style.background = "var(--accent-indigo)";
  scannerLaser.style.boxShadow = "0 0 8px var(--accent-indigo)";
  
  let laserTop = 0;
  let laserDirection = 1;
  const laserInterval = setInterval(() => {
    laserTop += 2 * laserDirection;
    if (laserTop >= 100) laserDirection = -1;
    if (laserTop <= 0) laserDirection = 1;
    scannerLaser.style.top = `${laserTop}%`;
  }, 16);

  for (let i = 0; i < doc.logs.length; i++) {
    const line = doc.logs[i]!;
    
    // Update checklist icons dynamically
    if (line.includes('[OCR]')) {
      checkOcr.style.color = "var(--accent-emerald)";
      checkOcr.querySelector('.check-icon')!.innerHTML = "✓";
    }
    if (line.includes('[SCREENING] Querying local PEP')) {
      checkWatchlist.style.color = line.includes('OFAC screening hit!') ? "var(--accent-rose)" : "var(--accent-emerald)";
      checkWatchlist.querySelector('.check-icon')!.innerHTML = line.includes('OFAC screening hit!') ? "✗" : "✓";
    }
    if (line.includes('[WARNING]') && line.includes('OFAC screening hit')) {
      checkWatchlist.style.color = "var(--accent-rose)";
      checkWatchlist.querySelector('.check-icon')!.innerHTML = "✗";
    }
    if (line.includes('[VERIFICATION]')) {
      checkPep.style.color = selected === 'flagged_person' ? "var(--accent-rose)" : selected === 'invalid_document' ? "var(--text-secondary)" : "var(--accent-emerald)";
      checkPep.querySelector('.check-icon')!.innerHTML = selected === 'flagged_person' ? "✗" : selected === 'invalid_document' ? "○" : "✓";
    }

    const isError = line.includes('[ERROR]') || line.includes('[WARNING]');
    const isSuccess = line.includes('[SUCCESS]') || line.includes('[OCR]') || line.includes('[SUCCESS]');
    const color = isError ? 'warn' : isSuccess ? 'success' : 'text';
    
    const div = document.createElement('div');
    div.className = `terminal-line ${color}`;
    div.innerText = line;
    kycTerminal.appendChild(div);
    kycTerminal.scrollTop = kycTerminal.scrollHeight;

    await new Promise(r => setTimeout(r, 350));
  }

  clearInterval(laserInterval);
  scannerLaser.style.display = "none";

  kycStatus.innerText = doc.status;
  kycStatus.style.color = doc.statusColor;

  visualScore.innerText = `Score: ${doc.score}`;
  if (doc.status === 'VERIFIED') {
    visualScore.style.color = "var(--accent-emerald)";
    mockIdCard.style.borderColor = "var(--accent-emerald)";
  } else {
    visualScore.style.color = "var(--accent-rose)";
    mockIdCard.style.borderColor = "var(--accent-rose)";
  }

  verifying = false;
  runBtn.disabled = false;
}

runBtn.addEventListener('click', executeKYC);
dropzone.addEventListener('click', executeKYC);

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
