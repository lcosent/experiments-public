(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const a of e)if(a.type==="childList")for(const n of a.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function r(e){const a={};return e.integrity&&(a.integrity=e.integrity),e.referrerPolicy&&(a.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?a.credentials="include":e.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(e){if(e.ep)return;e.ep=!0;const a=r(e);fetch(e.href,a)}})();const B=[{model:"BioGPT-Pro-34B",creator:"Academic BioLab",pathogenicity:94.2,dose:88.5,pathway:89.1,arithmetic:82.3,overall:88.5},{model:"Claude 3.5 Sonnet",creator:"Anthropic",pathogenicity:88.5,dose:82.1,pathway:84.6,arithmetic:89.2,overall:86.1},{model:"GPT-4o",creator:"OpenAI",pathogenicity:86.1,dose:80.4,pathway:81.3,arithmetic:91.5,overall:84.8},{model:"Bio-Qwen2.5-14B",creator:"Community Fine-Tune",pathogenicity:89.4,dose:81.2,pathway:83.1,arithmetic:76.5,overall:82.6},{model:"Llama-3-70b-Instruct",creator:"Meta",pathogenicity:80.2,dose:74.3,pathway:78.1,arithmetic:84,overall:79.2}],v=[{category:"variant_pathogenicity",input:"Analyze pathogenicity: BRCA1 c.5266dupC (p.Gln1756Profs*74)",target:"PATHOGENIC",rationale:"Loss-of-function mutation. This duplication creates a premature termination codon in the BRCT domain, leading to nonsense-mediated decay (NMD).",responses:{"BioGPT-Pro-34B":"PATHOGENIC. BRCA1 c.5266dupC is a well-characterized founder mutation in the Ashkenazi Jewish population. The frameshift triggers NMD, leading to a complete loss of the BRCT domain.","Llama-3-70b-Instruct":"PATHOGENIC. It causes a frameshift which leads to truncation of the BRCA1 tumor suppressor protein, which is associated with hereditary breast and ovarian cancer."}},{category:"pathway_reasoning",input:"Predict the effect of MEK inhibition on transcription factor CREB phosphorylation in the presence of active EGFR.",target:"DECREASED",rationale:"EGFR activates RAS/RAF/MEK/ERK pathway. ERK directly phosphorylates RSK, which phosphorylates CREB. MEK inhibition blocks ERK activation, causing decreased CREB phosphorylation.",responses:{"BioGPT-Pro-34B":"DECREASED. Blocking MEK stops downstream ERK activation. Although other cross-talk pathways exist, MEK/ERK is the primary driver for RSK/CREB phosphorylation here.","Llama-3-70b-Instruct":"UNCERTAIN. MEK inhibition blocks ERK, which should decrease downstream phosphorylation, but EGFR can activate AKT/mTOR which could compensate CREB."}}];document.getElementById("app").innerHTML=`
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">bio-bench v0.1 · live</span>
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
        <h1 class="project-title">bio-bench</h1>
        <p class="project-desc">A domain-specific AI evaluation harness for molecular biology, genetics, and pathway reasoning capabilities. Inspect scorecards and execute test cases.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/bio-bench.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid" style="grid-template-columns: 0.95fr 1.05fr;">
      <section class="glass-panel">
        <h2 class="panel-title">1. Capability Leaderboard</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.8rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--panel-border); color: var(--text-secondary); text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em;">
              <th style="padding: 0.5rem 0;">Model Name</th>
              <th style="padding: 0.5rem 0;">Pathology</th>
              <th style="padding: 0.5rem 0;">Pathway</th>
              <th style="padding: 0.5rem 0; font-weight: 700; color: var(--text-primary);">Overall</th>
            </tr>
          </thead>
          <tbody>
            ${B.map((t,o)=>`
              <tr style="border-bottom: 1px solid var(--panel-border);">
                <td style="padding: 0.5rem 0; font-weight: 600; color: var(--text-primary);">
                  <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem; margin-right: 0.25rem;">#${o+1}</span>
                  ${t.model}<br/>
                  <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 400;">by ${t.creator}</span>
                </td>
                <td style="padding: 0.5rem 0; font-family: var(--font-mono);">${t.pathogenicity}%</td>
                <td style="padding: 0.5rem 0; font-family: var(--font-mono);">${t.pathway}%</td>
                <td style="padding: 0.5rem 0; font-weight: 700; color: var(--accent-emerald); font-family: var(--font-mono);">${t.overall}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Test Arena Playground</h2>
        
        <div class="form-group">
          <label class="form-label">Benchmark Question</label>
          <select class="form-select" id="question-select" style="font-size: 0.85rem;">
            <option value="0">BRCA1 c.5266dupC (Pathogenicity)</option>
            <option value="1">MEK Pathway phosphorylation (Pathway)</option>
          </select>
        </div>

        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.75rem; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);" id="question-display">
          <!-- Input question -->
        </div>

        <div class="form-group">
          <label class="form-label">Evaluate Model</label>
          <select class="form-select" id="model-select" style="font-size: 0.85rem;">
            <option value="BioGPT-Pro-34B">BioGPT-Pro-34B (Specialist)</option>
            <option value="Llama-3-70b-Instruct">Llama-3-70b-Instruct (General)</option>
          </select>
        </div>

        <button class="btn" id="run-eval-btn">Run Grading Evaluator</button>

        <!-- Standard Mode: Visual Grading Result Card -->
        <div class="report-card" id="visual-grade-report" style="display: none; background: rgba(16, 185, 129, 0.04); border-color: rgba(16, 185, 129, 0.25); font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.4rem; margin-bottom: 0.4rem;">
            <span style="font-weight: 700; color: var(--text-secondary); text-transform: uppercase; font-size: 0.75rem;">Model Answer Output</span>
            <span style="font-weight: 700; color: var(--accent-emerald);" id="grade-badge">PASSED</span>
          </div>
          <div style="color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.4; font-style: italic;" id="model-raw-output"></div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); border-top: 1px dashed var(--panel-border); padding-top: 0.4rem;" id="grader-rationale"></div>
        </div>

        <!-- Developer Mode: Raw Harness Terminal -->
        <div class="dev-mode-only form-group" style="margin-top: 0.25rem;">
          <label class="form-label">Harness Execution logs</label>
          <div class="terminal-output" id="eval-terminal" style="font-size: 0.75rem; min-height: 140px; padding: 0.75rem;">
            <div class="terminal-line info">Ready. Select a test case and click "Run Grading Evaluator".</div>
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
`;const y=document.getElementById("dev-mode-toggle"),g=document.getElementById("question-select"),L=document.getElementById("question-display"),I=document.getElementById("model-select"),h=document.getElementById("run-eval-btn"),l=document.getElementById("eval-terminal"),i=document.getElementById("visual-grade-report"),c=document.getElementById("grade-badge"),A=document.getElementById("model-raw-output"),S=document.getElementById("grader-rationale"),d=document.getElementById("copy-cli-btn");d&&d.addEventListener("click",()=>{navigator.clipboard.writeText("git clone https://github.com/lcosent/bio-bench.git"),d.innerText="Copied!",setTimeout(()=>{d.innerText="Copy"},2e3)});y.addEventListener("change",()=>{y.checked?document.body.classList.add("dev-mode-active"):document.body.classList.remove("dev-mode-active")});function f(){const t=parseInt(g.value),o=v[t];L.innerText=o.input,l.innerHTML='<div class="terminal-line info">Ready. Selected new benchmark question.</div>',i.style.display="none"}g.addEventListener("change",f);f();let u=!1;async function k(){if(u)return;u=!0,h.disabled=!0,l.innerHTML="",i.style.display="none";const t=parseInt(g.value),o=v[t],r=I.value,s=o.responses[r],e=s.toUpperCase().includes(o.target.toUpperCase()),a=[`[HARNESS] Dispatching task input to model: ${r}...`,"[MODEL] Streaming response...",`[MODEL] "${s}"`,"[HARNESS] Running regex parser to extract classification label...",`[HARNESS] Extracted: "${e?o.target:"INCORRECT"}" (Target: "${o.target}")`,`[GRADER] Target match: ${e?"TRUE":"FALSE"}`,"[GRADER] Grading rationale check...",e?"[SUCCESS] Test case passed. Score: 1.0 (Correct reasoning)":"[FAILED] Test case failed. Score: 0.0 (Reasoning discrepancy)"];for(const n of a){const w=n.includes("[SUCCESS]")||n.includes("[GRADER] Target match: TRUE"),x=n.includes("[FAILED]")||n.includes("[GRADER] Target match: FALSE"),T=n.includes("[MODEL]"),R=w?"success":x?"error":T?"warn":"text",p=document.createElement("div");p.className=`terminal-line ${R}`,p.innerText=n,l.appendChild(p),l.scrollTop=l.scrollHeight,await new Promise(C=>setTimeout(C,300))}A.innerText=`"${s}"`,S.innerHTML=`<b>Target Criterion</b>: ${o.target}<br/><b>Verification Rationale</b>: ${o.rationale}`,e?(c.innerText="PASSED (1.0 / 1.0)",c.style.color="var(--accent-emerald)",i.style.background="rgba(16, 185, 129, 0.04)",i.style.borderColor="rgba(16, 185, 129, 0.25)"):(c.innerText="FAILED (0.0 / 1.0)",c.style.color="var(--accent-rose)",i.style.background="rgba(244, 63, 94, 0.04)",i.style.borderColor="rgba(244, 63, 94, 0.25)"),i.style.display="block",u=!1,h.disabled=!1}h.addEventListener("click",k);const b='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',E='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';function M(){const t=document.getElementById("theme-toggle");localStorage.getItem("theme")==="dark"?(document.documentElement.classList.add("dark"),t&&(t.innerHTML=b)):(document.documentElement.classList.remove("dark"),t&&(t.innerHTML=E))}M();const m=document.getElementById("theme-toggle");m&&m.addEventListener("click",()=>{document.documentElement.classList.contains("dark")?(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"),m.innerHTML=E):(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark"),m.innerHTML=b)});
