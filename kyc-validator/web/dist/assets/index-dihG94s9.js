(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function s(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(t){if(t.ep)return;t.ep=!0;const i=s(t);fetch(t.href,i)}})();const S={valid_passport:{docType:"Passport",name:"ALICE SMITH",dob:"1988-11-12",number:"N472819382",country:"US",status:"VERIFIED",statusColor:"var(--accent-emerald)",mrz:"P<USA<<SMITH<<ALICE<<<<<<<<<<<<<<<<<<<<<<<",score:"98/100",logs:["[SYSTEM] Initializing on-device WebAssembly OCR parser...","[OCR] Document structure matches US Passport V3 layout.","[OCR] MRZ (Machine Readable Zone) decoded successfully.","[OCR] Extracted: Name='ALICE SMITH' DOB='1988-11-12' ID='N472819382' Country='US'.","[SCREENING] Querying local OFAC SDN index...","[SCREENING] Querying local PEP (Politically Exposed Person) registry...","[SCREENING] Watchlist matches: 0 hits (Confidence > 95%).","[VERIFICATION] Verification score: 98/100 (Pass).","[SUCCESS] KYC validation complete. Transaction authorized."]},flagged_person:{docType:"Driver's License",name:"VLADIMIR IVANOV",dob:"1972-04-20",number:"DL78291038",country:"RU",status:"DENIED - OFAC HIT",statusColor:"var(--accent-rose)",mrz:"I<RUS<<IVANOV<<VLADIMIR<<<<<<<<<<<<<<<<<<<<<",score:"12/100",logs:["[SYSTEM] Initializing on-device WebAssembly OCR parser...","[OCR] Document structure matches RU Driver License layout.","[OCR] OCR Text recognition confidence: 91%.","[OCR] Extracted: Name='VLADIMIR IVANOV' DOB='1972-04-20' ID='DL78291038' Country='RU'.","[SCREENING] Querying local OFAC SDN index...","[WARNING] OFAC screening hit! Found match: 'VLADIMIR IVANOV', DOB='1972-04-20', Status='SDN Entity'.","[SCREENING] Querying local PEP registry...","[PEP] PEP match: 1 hit (State Owned Enterprise executive).","[VERIFICATION] Verification score: 12/100 (Fail).","[ERROR] Match detected on OFAC SDN List. Transaction frozen, compliance report generated."]},invalid_document:{docType:"Utility Bill",name:"JOHN DOE",dob:"N/A",number:"BILL-8927182",country:"CA",status:"FAILED - EXPIRED/BLURRY",statusColor:"var(--accent-rose)",mrz:"MRZ NOT SUPPORTED ON UTILITY DOCUMENTS",score:"45/100",logs:["[SYSTEM] Initializing on-device WebAssembly OCR parser...","[OCR] Document structure matches Canadian Utility Bill layout.","[OCR] Extracting address proof criteria...","[OCR] Extracted: Name='JOHN DOE' Date='2025-10-15' Issuer='Hydro-Quebec'.","[WARNING] Document issue date is older than 90 days (Expired).","[SCREENING] Sourcing secondary proof of residency...","[VERIFICATION] Verification score: 45/100 (Fail).","[ERROR] Address proof expired. Rejecting proof of address document."]}};document.getElementById("app").innerHTML=`
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
        <span class="cli-code">git clone https://github.com/lcosent/kyc-validator.git</span>
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
`;const C=document.getElementById("dev-mode-toggle"),E=document.getElementById("doc-select"),A=document.getElementById("dropzone"),f=document.getElementById("dropzone-text"),b=document.getElementById("run-kyc-btn"),a=document.getElementById("kyc-status"),d=document.getElementById("kyc-terminal"),c=document.getElementById("scanner-laser"),I=document.getElementById("mock-id-card"),h=document.getElementById("id-photo"),M=document.getElementById("id-doc-label"),B=document.getElementById("id-name"),P=document.getElementById("id-dob"),z=document.getElementById("id-no"),V=document.getElementById("id-mrz"),y=document.getElementById("check-ocr"),l=document.getElementById("check-watchlist"),v=document.getElementById("check-pep"),m=document.getElementById("visual-score"),p=document.getElementById("copy-cli-btn");p&&p.addEventListener("click",()=>{navigator.clipboard.writeText("git clone https://github.com/lcosent/kyc-validator.git"),p.innerText="Copied!",setTimeout(()=>{p.innerText="Copy"},2e3)});C.addEventListener("change",()=>{C.checked?document.body.classList.add("dev-mode-active"):document.body.classList.remove("dev-mode-active")});function k(){const o=E.value,e=S[o];o==="valid_passport"?(f.innerText="US_Passport_Alice_Smith.jpg",h.innerText="👩"):o==="flagged_person"?(f.innerText="RU_Driver_License_Vladimir_Ivanov.png",h.innerText="👨"):(f.innerText="Hydro_Quebec_Utility_John_Doe.pdf",h.innerText="📄"),M.innerText=e.docType,B.innerText=e.name,P.innerText=`DOB: ${e.dob}`,z.innerText=`No: ${e.number}`,V.innerText=e.mrz,y.style.color="var(--text-secondary)",y.querySelector(".check-icon").innerHTML="○",l.style.color="var(--text-secondary)",l.querySelector(".check-icon").innerHTML="○",v.style.color="var(--text-secondary)",v.querySelector(".check-icon").innerHTML="○",m.innerText="Pending",m.style.color="var(--accent-indigo)",a.innerText="READY",a.style.color="var(--text-secondary)",d.innerHTML='<div class="terminal-line info">Ready. Selected new document profile.</div>',I.style.borderColor="var(--panel-border)",c.style.display="none"}E.addEventListener("change",k);k();let x=!1;async function T(){if(x)return;x=!0,b.disabled=!0,d.innerHTML="",a.innerText="SCANNING...",a.style.color="var(--accent-indigo)";const o=E.value,e=S[o];c.style.display="block",c.style.background="var(--accent-indigo)",c.style.boxShadow="0 0 8px var(--accent-indigo)";let s=0,r=1;const t=setInterval(()=>{s+=2*r,s>=100&&(r=-1),s<=0&&(r=1),c.style.top=`${s}%`},16);for(let i=0;i<e.logs.length;i++){const n=e.logs[i];n.includes("[OCR]")&&(y.style.color="var(--accent-emerald)",y.querySelector(".check-icon").innerHTML="✓"),n.includes("[SCREENING] Querying local PEP")&&(l.style.color=n.includes("OFAC screening hit!")?"var(--accent-rose)":"var(--accent-emerald)",l.querySelector(".check-icon").innerHTML=n.includes("OFAC screening hit!")?"✗":"✓"),n.includes("[WARNING]")&&n.includes("OFAC screening hit")&&(l.style.color="var(--accent-rose)",l.querySelector(".check-icon").innerHTML="✗"),n.includes("[VERIFICATION]")&&(v.style.color=o==="flagged_person"?"var(--accent-rose)":o==="invalid_document"?"var(--text-secondary)":"var(--accent-emerald)",v.querySelector(".check-icon").innerHTML=o==="flagged_person"?"✗":o==="invalid_document"?"○":"✓");const L=n.includes("[ERROR]")||n.includes("[WARNING]"),O=n.includes("[SUCCESS]")||n.includes("[OCR]")||n.includes("[SUCCESS]"),N=L?"warn":O?"success":"text",g=document.createElement("div");g.className=`terminal-line ${N}`,g.innerText=n,d.appendChild(g),d.scrollTop=d.scrollHeight,await new Promise(w=>setTimeout(w,350))}clearInterval(t),c.style.display="none",a.innerText=e.status,a.style.color=e.statusColor,m.innerText=`Score: ${e.score}`,e.status==="VERIFIED"?(m.style.color="var(--accent-emerald)",I.style.borderColor="var(--accent-emerald)"):(m.style.color="var(--accent-rose)",I.style.borderColor="var(--accent-rose)"),x=!1,b.disabled=!1}b.addEventListener("click",T);A.addEventListener("click",T);const R='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',D='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';function _(){const o=document.getElementById("theme-toggle");localStorage.getItem("theme")==="dark"?(document.documentElement.classList.add("dark"),o&&(o.innerHTML=R)):(document.documentElement.classList.remove("dark"),o&&(o.innerHTML=D))}_();const u=document.getElementById("theme-toggle");u&&u.addEventListener("click",()=>{document.documentElement.classList.contains("dark")?(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"),u.innerHTML=D):(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark"),u.innerHTML=R)});
