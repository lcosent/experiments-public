import './style.css';

const defaultDecisions: Record<string, { title: string; content: string; debate: Array<{ role: string; name: string; text: string }>; judge: { scoreA: number; scoreB: number; winner: string; risks: string[]; recommendation: string } }> = {
  remote_hire: {
    title: "Should we hire Senior Engineer A as a remote-only contributor with no timezone overlap?",
    content: `## Context\n- 12-person engineering team, all in PST.\n- Candidate is in CET (~9-hour offset).\n- Rituals: daily 1-hour standup, weekly arch review.\n- References: ex-Stripe, ex-Plaid; async-first recommendations.\n- We have never hired async-only before.`,
    debate: [
      {
        role: "advocate",
        name: "Advocate Agent",
        text: "Strong technical signal: The candidate has three principal-engineer recommendations and a proven history of shipping high-quality infrastructure at Stripe. Async-first talent is rare. Adapting our workflow to async is a positive forcing function that will improve our written documentation and system design specs overall."
      },
      {
        role: "skeptic",
        name: "Skeptic Agent",
        text: "Operational tax: Daily syncs and ad-hoc architecture reviews are core to our speed. A 9-hour timezone offset means zero overlap. The candidate will be siloed, blocked for 18 hours on questions, or we will be forced to schedule late night/early morning meetings, burning out the existing team."
      },
      {
        role: "advocate",
        name: "Advocate Agent",
        text: "We can mitigate this by structuring work into isolated components with clear API boundaries. The candidate's background shows they require very little hand-holding. If we reject candidate A, we remain understaffed for another 6 months while waiting for a same-timezone candidate who may not have this calibre."
      },
      {
        role: "skeptic",
        name: "Skeptic Agent",
        text: "Understaffed is better than disrupted. Hiring a remote contributor without timezone overlap requires an async-mature organization. We do not have structured RFCs or API handoffs in place yet. Introducing this level of friction now will slow down the entire 12-person squad, not speed it up."
      }
    ],
    judge: {
      winner: "Skeptic Agent",
      scoreA: 7.2,
      scoreB: 8.5,
      risks: [
        "Communication gaps on critical pull requests due to 9-hour offset.",
        "Team culture alignment: candidate misses informal design conversations.",
        "Hiring pressure forcing operational shift before team is ready."
      ],
      recommendation: "WAIT — Establish async rituals (RACI, RFCs) first before extending off-timezone offers."
    }
  },
  kotlin_migration: {
    title: "Should we migrate the primary backend from Java 17 to Kotlin?",
    content: `## Context\n- 380kloc backend, Java 17, Spring Boot.\n- 22 backend engineers, 6 with Kotlin experience.\n- JVM performance is stable; no throughput issues.\n- Two new product lines being scoped - option to build in Kotlin.`,
    debate: [
      {
        role: "advocate",
        name: "Advocate Agent",
        text: "Modern engineering ergonomics: Kotlin reduces boilerplate by 30-40%, eliminates NullPointerExceptions at compile-time, and supports coroutines for simpler asynchronous code. Our 22 engineers will be more productive. The interop with Java is flawless, meaning we can write all new microservices in Kotlin."
      },
      {
        role: "skeptic",
        name: "Skeptic Agent",
        text: "Hidden costs: Flawless interop is a myth in complex Spring Boot applications. Mixed-language codebases increase build times and create cognitive friction during debugging. With only 6 of 22 engineers having Kotlin experience, we face a substantial training tax and a split team."
      },
      {
        role: "advocate",
        name: "Advocate Agent",
        text: "Kotlin's learning curve for Java devs is extremely shallow (typically 1-2 weeks). The productivity gains over a multi-year horizon far outweigh the temporary training cost. It also increases developer retention and hiring appeal, as engineers strongly prefer modern languages."
      },
      {
        role: "skeptic",
        name: "Skeptic Agent",
        text: "Our current Java 17 setup is stable, performant, and has zero GC issues. Java itself is evolving rapidly with records, sealed classes, and virtual threads (Project Loom). We can achieve 90% of Kotlin's benefits without the operational risk of a split codebase and build toolchain complications."
      }
    ],
    judge: {
      winner: "Advocate Agent",
      scoreA: 8.4,
      scoreB: 7.8,
      risks: [
        "Mixed compilation (kotlinc + javac) increases CI build durations.",
        "Spring framework lifecycle: Spring requires open classes, Kotlin makes final by default.",
        "Split code review friction: non-Kotlin devs unable to review complex PRs comfortably."
      ],
      recommendation: "PROCEED INCREMENTALLY — Authorize new services in Kotlin. Freeze old-code conversions."
    }
  }
};

// HTML Structure
document.getElementById('app')!.innerHTML = `
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
`;

// Handles
const devModeToggle = document.getElementById('dev-mode-toggle') as HTMLInputElement;
const scenarioSelect = document.getElementById('scenario-select') as HTMLSelectElement;
const proposalTitle = document.getElementById('proposal-title') as HTMLInputElement;
const proposalContext = document.getElementById('proposal-context') as HTMLTextAreaElement;
const debateBtn = document.getElementById('debate-btn') as HTMLButtonElement;
const chatContainer = document.getElementById('chat-container')!;
const verdictCard = document.getElementById('verdict-card')!;
const verdictWinner = document.getElementById('verdict-winner')!;
const verdictBody = document.getElementById('verdict-body')!;
const devTerminal = document.getElementById('dev-terminal')!;

// CLI copy helper
const copyBtn = document.getElementById('copy-cli-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('git clone https://github.com/lcosent/agent-debate.git');
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

function loadScenario() {
  const val = scenarioSelect.value;
  if (val === 'custom') {
    proposalTitle.value = "Migrate Database to Serverless Postgres";
    proposalContext.value = "## Context\\n- Core user DB is 420GB.\\n- Experiencing peak traffic scaling spikes daily.\\n- Current DBA team of 1.";
    proposalTitle.readOnly = false;
    proposalContext.readOnly = false;
  } else {
    const sc = defaultDecisions[val];
    proposalTitle.value = sc.title;
    proposalContext.value = sc.content;
    proposalTitle.readOnly = true;
    proposalContext.readOnly = true;
  }
  chatContainer.innerHTML = `<div style="color: var(--text-secondary); text-align: center; margin-top: 5rem; font-style: italic;">Click "Run Multi-Agent Debate" to initiate the session.</div>`;
  verdictCard.style.display = 'none';
  devTerminal.innerHTML = '';
}

scenarioSelect.addEventListener('change', loadScenario);
loadScenario();

let debateActive = false;

function addDevLog(msg: string) {
  const line = document.createElement('div');
  line.className = 'terminal-line info';
  line.innerText = msg;
  devTerminal.appendChild(line);
  devTerminal.scrollTop = devTerminal.scrollHeight;
}

async function runDebate() {
  if (debateActive) return;
  debateActive = true;
  debateBtn.disabled = true;
  chatContainer.innerHTML = '';
  verdictCard.style.display = 'none';
  devTerminal.innerHTML = '';

  const scenarioVal = scenarioSelect.value;
  let debateRounds: Array<{ role: string; name: string; text: string }> = [];
  let judgeResult = { winner: '', scoreA: 0, scoreB: 0, risks: [] as string[], recommendation: '' };

  if (scenarioVal === 'custom') {
    const titleText = proposalTitle.value;
    debateRounds = [
      {
        role: "advocate", name: "Advocate Agent",
        text: `Regarding "${titleText}": We should proceed. Serverless database scaling completely mitigates peak load failures and reduces operational support burdens for our single DBA.`
      },
      {
        role: "skeptic", name: "Skeptic Agent",
        text: "We should wait. Migrating a 420GB active production database to a serverless platform introduces cold-start latency issues, unpredictable cost profiles, and substantial cutover operational risks."
      },
      {
        role: "advocate", name: "Advocate Agent",
        text: "Cold start concerns are solved by pooling and minimum provisioned capacities. The cost transparency can be managed with hard limits. Delaying invites more peak-traffic outages."
      },
      {
        role: "skeptic", name: "Skeptic Agent",
        text: "Limits defeat the scaling benefit. Outages should be mitigated by read-replicas, which are stable and well-understood. A cutover migration of this size is highly risky for a small team."
      }
    ];
    judgeResult = {
      winner: "Skeptic Agent",
      scoreA: 6.8,
      scoreB: 8.2,
      risks: [
        "Unpredictable pricing scales for large analytical queries.",
        "Lack of rollback staging environments.",
        "Lack of familiarity with serverless Postgres query optimizers."
      ],
      recommendation: "WAIT — Build a replica staging environment and run performance benchmarks before commiting to cutover."
    };
  } else {
    debateRounds = defaultDecisions[scenarioVal].debate;
    judgeResult = defaultDecisions[scenarioVal].judge;
  }

  // Play rounds
  addDevLog("[DEBATE] Orchestrating advocate-skeptic round-robin loop...");
  
  for (let i = 0; i < debateRounds.length; i++) {
    const r = debateRounds[i];
    addDevLog(`[AGENT] Dispatching prompt to ${r.name}...`);
    
    // Create bubble
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${r.role}`;
    bubble.innerHTML = `
      <div class="chat-sender ${r.role}">${r.name}</div>
      <div class="chat-text"></div>
    `;
    chatContainer.appendChild(bubble);

    // Stream text
    const textDiv = bubble.querySelector('.chat-text') as HTMLDivElement;
    for (let charIdx = 0; charIdx < r.text.length; charIdx++) {
      textDiv.innerHTML += r.text[charIdx];
      chatContainer.scrollTop = chatContainer.scrollHeight;
      await new Promise(res => setTimeout(res, 8));
    }

    await new Promise(res => setTimeout(res, 600));
  }

  // Judge Verdict
  addDevLog("[JUDGE] Prompting judge agent for transcript analysis...");
  await new Promise(res => setTimeout(res, 800));

  // Stream Judge bubble
  const judgeBubble = document.createElement('div');
  judgeBubble.className = 'chat-bubble judge';
  judgeBubble.innerHTML = `
    <div class="chat-sender judge">Judge Agent</div>
    <div class="chat-text">Compiling scorecard analysis and risk report...</div>
  `;
  chatContainer.appendChild(judgeBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  await new Promise(res => setTimeout(res, 800));

  // Show report card
  verdictWinner.innerText = `Winner: ${judgeResult.winner}`;
  verdictBody.innerHTML = `
    <p style="margin-bottom: 0.5rem;"><b>Scorecard</b>: Advocate: ${judgeResult.scoreA}/10 | Skeptic: ${judgeResult.scoreB}/10</p>
    <p style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Key Uncalled Risks:</p>
    <ul style="padding-left: 1rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
      ${judgeResult.risks.map(risk => `<li>${risk}</li>`).join('')}
    </ul>
    <p><b>Recommendation</b>: <span style="color: var(--accent-violet); font-weight: 700;">${judgeResult.recommendation}</span></p>
  `;
  verdictCard.style.display = 'flex';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  addDevLog("[SYSTEM] Multi-agent debate session complete.");
  debateActive = false;
  debateBtn.disabled = false;
}

debateBtn.addEventListener('click', runDebate);

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
