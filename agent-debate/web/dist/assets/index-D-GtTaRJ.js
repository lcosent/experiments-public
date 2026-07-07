(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function o(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function r(e){if(e.ep)return;e.ep=!0;const t=o(e);fetch(e.href,t)}})();const h={remote_hire:{title:"Should we hire Senior Engineer A as a remote-only contributor with no timezone overlap?",content:`## Context
- 12-person engineering team, all in PST.
- Candidate is in CET (~9-hour offset).
- Rituals: daily 1-hour standup, weekly arch review.
- References: ex-Stripe, ex-Plaid; async-first recommendations.
- We have never hired async-only before.`,debate:[{role:"advocate",name:"Advocate Agent",text:"Strong technical signal: The candidate has three principal-engineer recommendations and a proven history of shipping high-quality infrastructure at Stripe. Async-first talent is rare. Adapting our workflow to async is a positive forcing function that will improve our written documentation and system design specs overall."},{role:"skeptic",name:"Skeptic Agent",text:"Operational tax: Daily syncs and ad-hoc architecture reviews are core to our speed. A 9-hour timezone offset means zero overlap. The candidate will be siloed, blocked for 18 hours on questions, or we will be forced to schedule late night/early morning meetings, burning out the existing team."},{role:"advocate",name:"Advocate Agent",text:"We can mitigate this by structuring work into isolated components with clear API boundaries. The candidate's background shows they require very little hand-holding. If we reject candidate A, we remain understaffed for another 6 months while waiting for a same-timezone candidate who may not have this calibre."},{role:"skeptic",name:"Skeptic Agent",text:"Understaffed is better than disrupted. Hiring a remote contributor without timezone overlap requires an async-mature organization. We do not have structured RFCs or API handoffs in place yet. Introducing this level of friction now will slow down the entire 12-person squad, not speed it up."}],judge:{winner:"Skeptic Agent",scoreA:7.2,scoreB:8.5,risks:["Communication gaps on critical pull requests due to 9-hour offset.","Team culture alignment: candidate misses informal design conversations.","Hiring pressure forcing operational shift before team is ready."],recommendation:"WAIT — Establish async rituals (RACI, RFCs) first before extending off-timezone offers."}},kotlin_migration:{title:"Should we migrate the primary backend from Java 17 to Kotlin?",content:`## Context
- 380kloc backend, Java 17, Spring Boot.
- 22 backend engineers, 6 with Kotlin experience.
- JVM performance is stable; no throughput issues.
- Two new product lines being scoped - option to build in Kotlin.`,debate:[{role:"advocate",name:"Advocate Agent",text:"Modern engineering ergonomics: Kotlin reduces boilerplate by 30-40%, eliminates NullPointerExceptions at compile-time, and supports coroutines for simpler asynchronous code. Our 22 engineers will be more productive. The interop with Java is flawless, meaning we can write all new microservices in Kotlin."},{role:"skeptic",name:"Skeptic Agent",text:"Hidden costs: Flawless interop is a myth in complex Spring Boot applications. Mixed-language codebases increase build times and create cognitive friction during debugging. With only 6 of 22 engineers having Kotlin experience, we face a substantial training tax and a split team."},{role:"advocate",name:"Advocate Agent",text:"Kotlin's learning curve for Java devs is extremely shallow (typically 1-2 weeks). The productivity gains over a multi-year horizon far outweigh the temporary training cost. It also increases developer retention and hiring appeal, as engineers strongly prefer modern languages."},{role:"skeptic",name:"Skeptic Agent",text:"Our current Java 17 setup is stable, performant, and has zero GC issues. Java itself is evolving rapidly with records, sealed classes, and virtual threads (Project Loom). We can achieve 90% of Kotlin's benefits without the operational risk of a split codebase and build toolchain complications."}],judge:{winner:"Advocate Agent",scoreA:8.4,scoreB:7.8,risks:["Mixed compilation (kotlinc + javac) increases CI build durations.","Spring framework lifecycle: Spring requires open classes, Kotlin makes final by default.","Split code review friction: non-Kotlin devs unable to review complex PRs comfortably."],recommendation:"PROCEED INCREMENTALLY — Authorize new services in Kotlin. Freeze old-code conversions."}}};document.getElementById("app").innerHTML=`
  <div class="status-bar">
    <div class="status-left">
      <a href="https://cosentino.me" class="status-link">← cosentino.me</a>
      <span class="status-title">agent-debate v0.1 · live</span>
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
        <h1 class="project-title">agent-debate</h1>
        <p class="project-desc">A multi-agent decision pressure-testing framework. Watch an Advocate, Skeptic, and Judge debate product, hiring, and M&A proposals to surface uncalled risks.</p>
      </div>
      <div class="cli-widget">
        <span class="cli-code">git clone https://github.com/lcosent/agent-debate.git</span>
        <button class="cli-copy-btn" id="copy-cli-btn">Copy</button>
      </div>
    </header>

    <main class="showcase-grid">
      <section class="glass-panel">
        <h2 class="panel-title">1. Decision Input</h2>
        
        <div class="form-group">
          <label class="form-label">Pre-loaded Scenario</label>
          <select class="form-select" id="scenario-select">
            <option value="remote_hire">Hire remote engineer (No overlap)</option>
            <option value="kotlin_migration">Backend Java to Kotlin migration</option>
            <option value="custom">Custom Decision...</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Decision Title</label>
          <input class="form-input" id="proposal-title" value="" />
        </div>

        <div class="form-group">
          <label class="form-label">Context Details</label>
          <textarea class="form-textarea" id="proposal-context" style="font-family: var(--font-body); min-height: 180px;"></textarea>
        </div>

        <button class="btn" id="debate-btn">Run Multi-Agent Debate</button>
      </section>

      <section class="glass-panel">
        <h2 class="panel-title">2. Debate Transcription</h2>
        
        <!-- Chat Bubble Playback (Default view) -->
        <div class="chat-container" id="chat-container">
          <div style="color: var(--text-secondary); text-align: center; margin-top: 5rem; font-style: italic;">
            Click "Run Multi-Agent Debate" to initiate the session.
          </div>
        </div>

        <!-- Verdict Report Card (Dynamic) -->
        <div class="report-card" id="verdict-card" style="display: none; background: rgba(139, 92, 246, 0.04); border-color: rgba(139, 92, 246, 0.25);">
          <div class="report-header">
            <span style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Judge's Verdict</span>
            <span class="report-status" id="verdict-winner" style="color: var(--accent-violet);">WINNER</span>
          </div>
          <div style="font-size: 0.88rem; color: var(--text-secondary);" id="verdict-body">
            <!-- Verdict points -->
          </div>
        </div>

        <!-- Raw Developer Terminal (Dev Mode Only) -->
        <div class="form-group dev-mode-only">
          <label class="form-label">Developer Console Logs</label>
          <div class="terminal-output" id="dev-terminal" style="font-size: 0.75rem; min-height: 150px;"></div>
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
`;const w=document.getElementById("dev-mode-toggle"),b=document.getElementById("scenario-select"),c=document.getElementById("proposal-title"),m=document.getElementById("proposal-context"),f=document.getElementById("debate-btn"),a=document.getElementById("chat-container"),y=document.getElementById("verdict-card"),L=document.getElementById("verdict-winner"),C=document.getElementById("verdict-body"),d=document.getElementById("dev-terminal"),p=document.getElementById("copy-cli-btn");p&&p.addEventListener("click",()=>{navigator.clipboard.writeText("git clone https://github.com/lcosent/agent-debate.git"),p.innerText="Copied!",setTimeout(()=>{p.innerText="Copy"},2e3)});w.addEventListener("change",()=>{w.checked?document.body.classList.add("dev-mode-active"):document.body.classList.remove("dev-mode-active")});function x(){const i=b.value;if(i==="custom")c.value="Migrate Database to Serverless Postgres",m.value="## Context\\n- Core user DB is 420GB.\\n- Experiencing peak traffic scaling spikes daily.\\n- Current DBA team of 1.",c.readOnly=!1,m.readOnly=!1;else{const n=h[i];c.value=n.title,m.value=n.content,c.readOnly=!0,m.readOnly=!0}a.innerHTML='<div style="color: var(--text-secondary); text-align: center; margin-top: 5rem; font-style: italic;">Click "Run Multi-Agent Debate" to initiate the session.</div>',y.style.display="none",d.innerHTML=""}b.addEventListener("change",x);x();let v=!1;function u(i){const n=document.createElement("div");n.className="terminal-line info",n.innerText=i,d.appendChild(n),d.scrollTop=d.scrollHeight}async function B(){if(v)return;v=!0,f.disabled=!0,a.innerHTML="",y.style.display="none",d.innerHTML="";const i=b.value;let n=[],o={winner:"",scoreA:0,scoreB:0,risks:[],recommendation:""};i==="custom"?(n=[{role:"advocate",name:"Advocate Agent",text:`Regarding "${c.value}": We should proceed. Serverless database scaling completely mitigates peak load failures and reduces operational support burdens for our single DBA.`},{role:"skeptic",name:"Skeptic Agent",text:"We should wait. Migrating a 420GB active production database to a serverless platform introduces cold-start latency issues, unpredictable cost profiles, and substantial cutover operational risks."},{role:"advocate",name:"Advocate Agent",text:"Cold start concerns are solved by pooling and minimum provisioned capacities. The cost transparency can be managed with hard limits. Delaying invites more peak-traffic outages."},{role:"skeptic",name:"Skeptic Agent",text:"Limits defeat the scaling benefit. Outages should be mitigated by read-replicas, which are stable and well-understood. A cutover migration of this size is highly risky for a small team."}],o={winner:"Skeptic Agent",scoreA:6.8,scoreB:8.2,risks:["Unpredictable pricing scales for large analytical queries.","Lack of rollback staging environments.","Lack of familiarity with serverless Postgres query optimizers."],recommendation:"WAIT — Build a replica staging environment and run performance benchmarks before commiting to cutover."}):(n=h[i].debate,o=h[i].judge),u("[DEBATE] Orchestrating advocate-skeptic round-robin loop...");for(let e=0;e<n.length;e++){const t=n[e];u(`[AGENT] Dispatching prompt to ${t.name}...`);const s=document.createElement("div");s.className=`chat-bubble ${t.role}`,s.innerHTML=`
      <div class="chat-sender ${t.role}">${t.name}</div>
      <div class="chat-text"></div>
    `,a.appendChild(s);const A=s.querySelector(".chat-text");for(let l=0;l<t.text.length;l++)A.innerHTML+=t.text[l],a.scrollTop=a.scrollHeight,await new Promise(E=>setTimeout(E,8));await new Promise(l=>setTimeout(l,600))}u("[JUDGE] Prompting judge agent for transcript analysis..."),await new Promise(e=>setTimeout(e,800));const r=document.createElement("div");r.className="chat-bubble judge",r.innerHTML=`
    <div class="chat-sender judge">Judge Agent</div>
    <div class="chat-text">Compiling scorecard analysis and risk report...</div>
  `,a.appendChild(r),a.scrollTop=a.scrollHeight,await new Promise(e=>setTimeout(e,800)),L.innerText=`Winner: ${o.winner}`,C.innerHTML=`
    <p style="margin-bottom: 0.5rem;"><b>Scorecard</b>: Advocate: ${o.scoreA}/10 | Skeptic: ${o.scoreB}/10</p>
    <p style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Key Uncalled Risks:</p>
    <ul style="padding-left: 1rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
      ${o.risks.map(e=>`<li>${e}</li>`).join("")}
    </ul>
    <p><b>Recommendation</b>: <span style="color: var(--accent-violet); font-weight: 700;">${o.recommendation}</span></p>
  `,y.style.display="flex",a.scrollTop=a.scrollHeight,u("[SYSTEM] Multi-agent debate session complete."),v=!1,f.disabled=!1}f.addEventListener("click",B);const k='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',T='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';function S(){const i=document.getElementById("theme-toggle");localStorage.getItem("theme")==="dark"?(document.documentElement.classList.add("dark"),i&&(i.innerHTML=k)):(document.documentElement.classList.remove("dark"),i&&(i.innerHTML=T))}S();const g=document.getElementById("theme-toggle");g&&g.addEventListener("click",()=>{document.documentElement.classList.contains("dark")?(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"),g.innerHTML=T):(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark"),g.innerHTML=k)});
