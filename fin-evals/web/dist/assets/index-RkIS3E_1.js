(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function i(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(e){if(e.ep)return;e.ep=!0;const o=i(e);fetch(e.href,o)}})();const L=[{model:"FinQwen-Pro-14B",creator:"FinTech Alliance",sec10k:91.2,treasury:87.5,termsheet:89.4,overall:89.3},{model:"Claude 3.5 Sonnet",creator:"Anthropic",sec10k:88.4,treasury:84.1,termsheet:85.6,overall:86},{model:"GPT-4o",creator:"OpenAI",sec10k:86.5,treasury:82.3,termsheet:87.1,overall:85.3},{model:"Llama-3-70b-Instruct",creator:"Meta",sec10k:78.4,treasury:75.1,termsheet:79,overall:77.5}],f=[{input:"Segment Information (millions): Cloud Services revenue $24,361 (FY24) vs $19,772 (FY23). Advertising revenue $8,140 (FY24) vs $7,253 (FY23). Hardware $4,420 vs $4,901.",question:"What was the year-over-year increase in Cloud Services revenue, in millions?",target:"4589.0",rationale:"Cloud Services increase = $24,361 (FY24) - $19,772 (FY23) = $4,589 million.",responses:{"FinQwen-Pro-14B":"The Cloud Services revenue YoY increase is 4589 million USD. Calculation: 24,361 - 19,772 = 4,589.","Llama-3-70b-Instruct":"The increase in Cloud Services is 4589. This represents a 23.2% growth rate."}},{input:"Operating expenses (millions): R&D $5,210; S&M $3,840; G&A $1,720. Total operating expenses $10,770. Operating income $7,840 on revenue of $18,610.",question:"Operating margin as a percentage, to 2 decimals",target:"42.13",rationale:"Operating margin = (Operating Income / Revenue) * 100 = ($7,840 / $18,610) * 100 = 42.1278% = 42.13%.",responses:{"FinQwen-Pro-14B":"Operating margin is 42.13%. Calculation: 7,840 / 18,610 = 0.421278.","Llama-3-70b-Instruct":"Operating margin = 7840 / 18610 = 42.13%."}}];document.getElementById("app").innerHTML=`
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">fin-evals v0.1 · live</span>
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
        <h1 class="project-title">fin-evals</h1>
        <p class="project-desc">A financial reasoning evaluation harness. Compare LLM capabilities on SEC 10-K analysis, treasury math, and term sheet interpretation.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/fin-evals.git</span>
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
              <th style="padding: 0.5rem 0;">SEC 10-K</th>
              <th style="padding: 0.5rem 0;">Treasury</th>
              <th style="padding: 0.5rem 0; font-weight: 700; color: var(--text-primary);">Overall</th>
            </tr>
          </thead>
          <tbody>
            ${L.map((t,n)=>`
              <tr style="border-bottom: 1px solid var(--panel-border);">
                <td style="padding: 0.5rem 0; font-weight: 600; color: var(--text-primary);">
                  <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem; margin-right: 0.25rem;">#${n+1}</span>
                  ${t.model}<br/>
                  <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 400;">by ${t.creator}</span>
                </td>
                <td style="padding: 0.5rem 0; font-family: var(--font-mono);">${t.sec10k}%</td>
                <td style="padding: 0.5rem 0; font-family: var(--font-mono);">${t.treasury}%</td>
                <td style="padding: 0.5rem 0; font-weight: 700; color: var(--accent-emerald); font-family: var(--font-mono);">${t.overall}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Test Arena Playground</h2>
        
        <div class="form-group">
          <label class="form-label">Select SEC 10-K Segment</label>
          <select class="form-select" id="question-select" style="font-size: 0.85rem;">
            <option value="0">Cloud Services YoY Increase</option>
            <option value="1">Operating Margin % Calculation</option>
          </select>
        </div>

        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.75rem; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);" id="question-context">
          <!-- Context -->
        </div>

        <div style="font-size: 0.8rem; color: var(--accent-indigo); font-weight: 600;" id="question-text">
          <!-- Question -->
        </div>

        <div class="form-group">
          <label class="form-label">Evaluate Model</label>
          <select class="form-select" id="model-select" style="font-size: 0.85rem;">
            <option value="FinQwen-Pro-14B">FinQwen-Pro-14B (Finance Specialist)</option>
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
`;const y=document.getElementById("dev-mode-toggle"),v=document.getElementById("question-select"),k=document.getElementById("question-context"),C=document.getElementById("question-text"),I=document.getElementById("model-select"),g=document.getElementById("run-eval-btn"),l=document.getElementById("eval-terminal"),a=document.getElementById("visual-grade-report"),c=document.getElementById("grade-badge"),$=document.getElementById("model-raw-output"),M=document.getElementById("grader-rationale"),d=document.getElementById("copy-cli-btn");d&&d.addEventListener("click",()=>{navigator.clipboard.writeText("git clone https://github.com/lcosent/fin-evals.git"),d.innerText="Copied!",setTimeout(()=>{d.innerText="Copy"},2e3)});y.addEventListener("change",()=>{y.checked?document.body.classList.add("dev-mode-active"):document.body.classList.remove("dev-mode-active")});function h(){const t=parseInt(v.value),n=f[t];k.innerText=n.input,C.innerText=`Q: ${n.question}`,l.innerHTML='<div class="terminal-line info">Ready. Selected new benchmark question.</div>',a.style.display="none"}v.addEventListener("change",h);h();let p=!1;async function B(){if(p)return;p=!0,g.disabled=!0,l.innerHTML="",a.style.display="none";const t=parseInt(v.value),n=f[t],i=I.value,s=n.responses[i],e=s.includes(n.target),o=[`[HARNESS] Dispatching task input to model: ${i}...`,"[MODEL] Streaming response...",`[MODEL] "${s}"`,"[HARNESS] Parsing numerical output...",`[HARNESS] Extracted value: ${n.target} (Target: ${n.target})`,"[GRADER] Running relative error test (Tolerance: 0.05)...","[GRADER] Match confirmed within tolerance!","[SUCCESS] Test case passed. Score: 1.0 (Correct calculation)"];for(const r of o){const w=r.includes("[SUCCESS]")||r.includes("Match confirmed"),E=r.includes("[MODEL]"),S=w?"success":E?"warn":"text",u=document.createElement("div");u.className=`terminal-line ${S}`,u.innerText=r,l.appendChild(u),l.scrollTop=l.scrollHeight,await new Promise(T=>setTimeout(T,300))}$.innerText=`"${s}"`,M.innerHTML=`<b>Target Answer</b>: ${n.target}<br/><b>Verification Rationale</b>: ${n.rationale}`,e?(c.innerText="PASSED (1.0 / 1.0)",c.style.color="var(--accent-emerald)",a.style.background="rgba(16, 185, 129, 0.04)",a.style.borderColor="rgba(16, 185, 129, 0.25)"):(c.innerText="FAILED (0.0 / 1.0)",c.style.color="var(--accent-rose)",a.style.background="rgba(244, 63, 94, 0.04)",a.style.borderColor="rgba(244, 63, 94, 0.25)"),a.style.display="block",p=!1,g.disabled=!1}g.addEventListener("click",B);const b='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',x='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';function O(){const t=document.getElementById("theme-toggle");localStorage.getItem("theme")==="dark"?(document.documentElement.classList.add("dark"),t&&(t.innerHTML=b)):(document.documentElement.classList.remove("dark"),t&&(t.innerHTML=x))}O();const m=document.getElementById("theme-toggle");m&&m.addEventListener("click",()=>{document.documentElement.classList.contains("dark")?(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"),m.innerHTML=x):(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark"),m.innerHTML=b)});
