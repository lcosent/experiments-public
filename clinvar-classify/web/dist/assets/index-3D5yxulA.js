(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();const _=[{variant:"BRCA1 c.5266dupC",truth:"PATHOGENIC",bundle:{gene_context:"BRCA1 tumor suppressor; hereditary breast and ovarian cancer syndrome. LoF intolerant gene (gnomAD pLI > 0.99).",pop_af:"gnomAD AF = 0.00012; 32 heterozygotes, 0 homozygotes",clinvar_summary:"37 submissions: 32 Pathogenic, 4 Likely Pathogenic, 1 VUS. Founder mutation in Ashkenazi Jewish population.",domain:"Frameshift in BRCT domain (p.Gln1756Profs*74); creates premature termination codon, likely triggering NMD."}},{variant:"BRCA1 c.4837A>G",truth:"BENIGN",bundle:{gene_context:"BRCA1 tumor suppressor.",pop_af:"gnomAD AF = 0.034; observed homozygotes",clinvar_summary:"120 submissions: 118 Benign, 2 Likely Benign.",domain:"p.Ser1613Gly; conservative substitution outside any structured domain."}},{variant:"BRCA2 c.7976+1G>A",truth:"PATHOGENIC",bundle:{gene_context:"BRCA2 tumor suppressor; hereditary breast and ovarian cancer.",pop_af:"gnomAD AF < 0.00001; not observed",clinvar_summary:"22 submissions: 20 Pathogenic, 2 Likely Pathogenic.",domain:"Canonical +1 splice donor site of intron 17; disrupts splicing; predicted to skip exon 17."}},{variant:"BRCA2 c.6275_6276delTT",truth:"PATHOGENIC",bundle:{gene_context:"BRCA2 tumor suppressor.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"15 submissions: 14 Pathogenic, 1 LP.",domain:"Frameshift p.Leu2092Profs*7; PTC in coding sequence; truncates DNA-binding domain."}},{variant:"TP53 c.524G>A",truth:"PATHOGENIC",bundle:{gene_context:"TP53 master tumor suppressor; Li-Fraumeni syndrome (germline) and somatic in most cancers.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"85 submissions: 78 Pathogenic, 6 LP, 1 VUS. Hotspot for somatic mutation.",domain:"p.Arg175His; DNA-binding domain hotspot; abolishes binding to p53 response elements and acts dominant-negative over wild-type."}},{variant:"TP53 c.215C>G",truth:"BENIGN",bundle:{gene_context:"TP53.",pop_af:"gnomAD AF = 0.18 (common polymorphism)",clinvar_summary:"90 submissions: 88 Benign.",domain:"p.Pro72Arg; well-known common polymorphism with functional differences but not disease-causing."}},{variant:"CFTR c.1521_1523delCTT",truth:"PATHOGENIC",bundle:{gene_context:"CFTR chloride channel; cystic fibrosis (autosomal recessive).",pop_af:"gnomAD AF = 0.0067; most common CF allele",clinvar_summary:"200+ submissions: Pathogenic consensus.",domain:"In-frame deletion p.Phe508del in NBD1; causes misfolding and ER retention; loss-of-function."}},{variant:"CFTR c.350G>A",truth:"PATHOGENIC",bundle:{gene_context:"CFTR.",pop_af:"gnomAD AF = 0.00088",clinvar_summary:"Pathogenic consensus across submitters.",domain:"p.Arg117His; partial-function allele associated with CF when in trans with severe allele."}},{variant:"HBB c.20A>T",truth:"PATHOGENIC",bundle:{gene_context:"HBB beta-globin gene; sickle cell anemia in homozygotes (autosomal recessive).",pop_af:"gnomAD AF = 0.008",clinvar_summary:"Pathogenic consensus; well-established disease association.",domain:"p.Glu7Val (HbS); gain-of-function via beta-globin polymerization under hypoxia."}},{variant:"MLH1 c.1731+5G>A",truth:"VUS",bundle:{gene_context:"MLH1 mismatch repair; Lynch syndrome (autosomal dominant cancer predisposition).",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"8 submissions: 3 VUS, 3 LP, 2 LB. Conflicting.",domain:"+5 splice donor position; conflicting splicing predictions; functional studies pending."}},{variant:"MLH1 c.116G>A",truth:"PATHOGENIC",bundle:{gene_context:"MLH1; Lynch syndrome.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"20 submissions: 18 Pathogenic, 2 LP.",domain:"p.Gly39Glu; ATPase domain; abolishes ATP binding; demonstrated MMR-deficient in cellular assays."}},{variant:"MSH2 exon 1-6 deletion",truth:"PATHOGENIC",bundle:{gene_context:"MSH2 mismatch repair; Lynch syndrome.",pop_af:"Not in gnomAD (structural variant)",clinvar_summary:"12 submissions: Pathogenic consensus.",domain:"Large deletion spanning exons 1-6; abolishes protein production; loss-of-function."}},{variant:"APOE c.388T>C",truth:"VUS",bundle:{gene_context:"APOE; defines the e4 allele; risk factor for late-onset Alzheimer's disease.",pop_af:"gnomAD AF = 0.14",clinvar_summary:"Mixed: classified as risk factor rather than pathogenic per ACMG.",domain:"p.Cys130Arg; defines e4 isoform; modifies amyloid clearance but does not directly cause disease."}},{variant:"MYH7 c.1208G>A",truth:"PATHOGENIC",bundle:{gene_context:"MYH7 beta-myosin heavy chain; hypertrophic cardiomyopathy.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"25 submissions: 23 Pathogenic.",domain:"p.Arg403Gln; motor domain hotspot; documented dominant-negative effect on sarcomere function."}},{variant:"MYH7 c.5128G>A",truth:"VUS",bundle:{gene_context:"MYH7.",pop_af:"gnomAD AF = 0.00003",clinvar_summary:"5 submissions: 3 VUS, 2 LP.",domain:"p.Glu1710Lys; rod domain; functional impact unclear; weak segregation data."}},{variant:"PMS2 c.2T>C",truth:"PATHOGENIC",bundle:{gene_context:"PMS2 mismatch repair; Lynch syndrome (atypical, milder phenotype).",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"10 submissions: 9 Pathogenic, 1 LP.",domain:"Disrupts initiation Met1; protein not produced from this allele; loss-of-function."}},{variant:"RYR1 c.7300G>A",truth:"PATHOGENIC",bundle:{gene_context:"RYR1 ryanodine receptor; malignant hyperthermia susceptibility.",pop_af:"gnomAD AF = 0.00012",clinvar_summary:"Pathogenic for MH; segregates with anesthetic-triggered reactions.",domain:"p.Gly2434Arg; central domain hotspot for MH; gain-of-function (calcium leak)."}},{variant:"FBN1 c.4621C>T",truth:"PATHOGENIC",bundle:{gene_context:"FBN1 fibrillin-1; Marfan syndrome (autosomal dominant connective tissue disorder).",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"8 submissions: Pathogenic.",domain:"p.Arg1541* nonsense; PTC in central rod domain; loss-of-function via NMD."}},{variant:"GJB2 c.35delG",truth:"PATHOGENIC",bundle:{gene_context:"GJB2 connexin 26; non-syndromic hearing loss (autosomal recessive).",pop_af:"gnomAD AF = 0.013",clinvar_summary:"Pathogenic consensus; most common cause of congenital hearing loss in many populations.",domain:"Frameshift in N-terminal cytoplasmic tail; abolishes channel formation."}},{variant:"HTT CAG x 42",truth:"PATHOGENIC",bundle:{gene_context:"HTT huntingtin; Huntington disease (autosomal dominant, age-dependent penetrance).",pop_af:"Not represented in gnomAD (repeat region)",clinvar_summary:"42-CAG threshold is well-established pathogenic length.",domain:"Polyglutamine expansion in N-terminal HTT; gain-of-function (toxic protein aggregates)."}},{variant:"BRCA1 c.181T>G",truth:"PATHOGENIC",bundle:{gene_context:"BRCA1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic per multiple submitters.",domain:"p.Cys61Gly; RING domain; abolishes BARD1 binding."}},{variant:"BRCA2 c.9976A>T",truth:"PATHOGENIC",bundle:{gene_context:"BRCA2.",pop_af:"gnomAD AF = 0.0009 in Icelandic populations (founder)",clinvar_summary:"Pathogenic; Icelandic founder mutation.",domain:"p.Lys3326* nonsense near C-terminus; partial truncation; mildly increased breast cancer risk."}},{variant:"BRCA1 c.5096G>A",truth:"VUS",bundle:{gene_context:"BRCA1.",pop_af:"gnomAD AF = 0.00005",clinvar_summary:"Conflicting: 6 LP, 4 VUS, 2 LB.",domain:"p.Arg1699Gln; BRCT domain; conflicting functional assay data."}},{variant:"TP53 c.733G>A",truth:"PATHOGENIC",bundle:{gene_context:"TP53.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic consensus.",domain:"p.Gly245Ser; DNA-binding domain hotspot."}},{variant:"CFTR c.3454G>C",truth:"VUS",bundle:{gene_context:"CFTR.",pop_af:"gnomAD AF = 0.0001",clinvar_summary:"Conflicting: 5 VUS, 3 LB, 2 LP.",domain:"p.Asp1152His; NBD2; mild CFTR-RD association in some patients."}},{variant:"HBB c.92+1G>A",truth:"PATHOGENIC",bundle:{gene_context:"HBB; beta-thalassemia in homozygotes.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic; abolishes splicing of intron 1.",domain:"Canonical +1 splice donor; loss-of-function."}},{variant:"MLH1 c.1959G>T",truth:"PATHOGENIC",bundle:{gene_context:"MLH1; Lynch syndrome.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic per multiple submitters.",domain:"p.Lys653Asn; conflicting on synonymous-vs-splice; functional studies show splice disruption."}},{variant:"MSH2 c.942+3A>T",truth:"PATHOGENIC",bundle:{gene_context:"MSH2.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic; +3 splice site variant; documented exon 5 skipping.",domain:"+3 intronic; splice donor disruption."}},{variant:"APOE c.137T>C",truth:"PATHOGENIC",bundle:{gene_context:"APOE.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic for type III hyperlipoproteinemia in homozygotes.",domain:"p.Leu46Pro; rare APOE variant disrupting receptor binding."}},{variant:"MYH7 c.2389G>A",truth:"PATHOGENIC",bundle:{gene_context:"MYH7.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic; multiple HCM families.",domain:"p.Asp797Asn; motor domain; dominant-negative."}},{variant:"BRCA1 c.68_69delAG",truth:"PATHOGENIC",bundle:{gene_context:"BRCA1.",pop_af:"gnomAD AF = 0.0011 in Ashkenazi populations (founder)",clinvar_summary:"Pathogenic; Ashkenazi founder mutation.",domain:"Frameshift in RING domain; loss-of-function."}},{variant:"BRCA2 c.5946delT",truth:"PATHOGENIC",bundle:{gene_context:"BRCA2.",pop_af:"gnomAD AF = 0.001 in Ashkenazi populations (founder)",clinvar_summary:"Pathogenic; Ashkenazi founder mutation.",domain:"Frameshift; loss-of-function."}},{variant:"MLH1 c.1852_1853delAA",truth:"PATHOGENIC",bundle:{gene_context:"MLH1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"Frameshift; LoF."}},{variant:"CFTR c.3909C>G",truth:"PATHOGENIC",bundle:{gene_context:"CFTR.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic for CF.",domain:"p.Asn1303Lys; NBD2; misfolding."}},{variant:"TP53 c.713G>A",truth:"PATHOGENIC",bundle:{gene_context:"TP53.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic; hotspot.",domain:"p.Cys238Tyr; DBD."}},{variant:"BRCA1 c.211A>G",truth:"VUS",bundle:{gene_context:"BRCA1.",pop_af:"gnomAD AF = 0.00009",clinvar_summary:"Conflicting: 4 VUS, 2 LB, 2 LP.",domain:"p.Arg71Gly; splice-region effect debated."}},{variant:"BRCA2 c.2808_2811delACAA",truth:"PATHOGENIC",bundle:{gene_context:"BRCA2.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"Frameshift; LoF."}},{variant:"MLH1 c.350C>T",truth:"PATHOGENIC",bundle:{gene_context:"MLH1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"p.Thr117Met; ATPase domain; documented MMR-deficient."}},{variant:"MSH2 c.1216C>T",truth:"PATHOGENIC",bundle:{gene_context:"MSH2.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"p.Arg406* nonsense; LoF."}},{variant:"RYR1 c.14387A>G",truth:"VUS",bundle:{gene_context:"RYR1.",pop_af:"gnomAD AF = 0.00003",clinvar_summary:"Conflicting: 3 VUS, 2 LP, 1 LB.",domain:"p.Lys4796Arg; uncertain functional impact."}},{variant:"FBN1 c.247G>A",truth:"PATHOGENIC",bundle:{gene_context:"FBN1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic for Marfan.",domain:"p.Asp83Asn; cbEGF-like domain; calcium-binding disruption."}},{variant:"GJB2 c.109G>A",truth:"PATHOGENIC",bundle:{gene_context:"GJB2.",pop_af:"gnomAD AF = 0.005",clinvar_summary:"Pathogenic for hearing loss in homozygotes.",domain:"p.Val37Ile; reduced channel function; mild allele."}},{variant:"BRCA1 c.815_824dup",truth:"PATHOGENIC",bundle:{gene_context:"BRCA1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"Duplication causes frameshift; LoF."}},{variant:"BRCA2 c.658_659delGT",truth:"PATHOGENIC",bundle:{gene_context:"BRCA2.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"Frameshift; LoF."}},{variant:"TP53 c.747G>C",truth:"VUS",bundle:{gene_context:"TP53.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Conflicting: 3 VUS, 2 LP.",domain:"p.Glu249Asp; DBD; functional impact unclear."}},{variant:"CFTR c.2657+5G>A",truth:"PATHOGENIC",bundle:{gene_context:"CFTR.",pop_af:"gnomAD AF = 0.00006",clinvar_summary:"Pathogenic; CFTR-RD association.",domain:"Splice donor +5 disruption."}},{variant:"HBB c.118C>T",truth:"PATHOGENIC",bundle:{gene_context:"HBB; beta-thalassemia.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"p.Gln40* nonsense; LoF."}},{variant:"MLH1 c.677G>A",truth:"PATHOGENIC",bundle:{gene_context:"MLH1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"p.Arg226Gln; splicing impact documented."}},{variant:"MSH2 c.380A>G",truth:"VUS",bundle:{gene_context:"MSH2.",pop_af:"gnomAD AF = 0.00002",clinvar_summary:"Conflicting: 4 VUS, 2 LB.",domain:"p.Asn127Ser; functional studies show partial activity."}},{variant:"APOE c.460G>A",truth:"BENIGN",bundle:{gene_context:"APOE.",pop_af:"gnomAD AF = 0.005",clinvar_summary:"Benign per submitters.",domain:"p.Asp154Asn; common variant, no disease association."}},{variant:"MYH7 c.5453A>G",truth:"BENIGN",bundle:{gene_context:"MYH7.",pop_af:"gnomAD AF = 0.002",clinvar_summary:"Benign.",domain:"p.Glu1818Gly; rod domain; common variant."}},{variant:"PMS2 c.137G>T",truth:"VUS",bundle:{gene_context:"PMS2.",pop_af:"gnomAD AF = 0.0003",clinvar_summary:"Conflicting submissions.",domain:"p.Ser46Ile; ATPase domain; functional studies pending."}},{variant:"RYR1 c.6502G>A",truth:"PATHOGENIC",bundle:{gene_context:"RYR1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic for MH.",domain:"p.Gly2168Ser; central domain; gain-of-function."}},{variant:"FBN1 c.2638G>A",truth:"PATHOGENIC",bundle:{gene_context:"FBN1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic for Marfan.",domain:"p.Asp880Asn; cbEGF; calcium-binding loss."}},{variant:"GJB2 c.139G>T",truth:"PATHOGENIC",bundle:{gene_context:"GJB2.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"p.Glu47*; nonsense; LoF."}},{variant:"BRCA1 c.3700_3704delGTAAA",truth:"PATHOGENIC",bundle:{gene_context:"BRCA1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"Frameshift; LoF."}},{variant:"BRCA2 c.7480C>T",truth:"PATHOGENIC",bundle:{gene_context:"BRCA2.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"p.Arg2494*; nonsense; LoF."}},{variant:"MLH1 c.546-1G>A",truth:"PATHOGENIC",bundle:{gene_context:"MLH1.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"Canonical splice acceptor -1; LoF."}},{variant:"MSH2 c.2T>C",truth:"PATHOGENIC",bundle:{gene_context:"MSH2.",pop_af:"gnomAD AF < 0.00001",clinvar_summary:"Pathogenic.",domain:"Disrupts initiation Met1; no protein."}},{variant:"BRCA1 c.5503C>T",truth:"VUS",bundle:{gene_context:"BRCA1.",pop_af:"gnomAD AF = 0.0001",clinvar_summary:"Conflicting: 3 VUS, 2 LB, 1 LP.",domain:"p.Arg1835*; near C-terminus; partial truncation."}}],u=_;document.getElementById("app").innerHTML=`
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
`;const f=document.getElementById("dev-mode-toggle"),h=document.getElementById("search-input"),C=document.getElementById("variants-list"),P=document.getElementById("detail-panel"),l=document.getElementById("copy-cli-btn");l&&l.addEventListener("click",()=>{navigator.clipboard.writeText("git clone https://github.com/lcosent/clinvar-classify.git"),l.innerText="Copied!",setTimeout(()=>{l.innerText="Copy"},2e3)});f.addEventListener("change",()=>{f.checked?document.body.classList.add("dev-mode-active"):document.body.classList.remove("dev-mode-active")});let g=u[0];function A(){const e=h.value.toLowerCase(),o=u.filter(t=>t.variant.toLowerCase().includes(e)||t.truth.toLowerCase().includes(e));C.innerHTML=o.map(t=>{const a=t.variant===g.variant,n=t.truth==="PATHOGENIC"?"var(--accent-rose)":t.truth==="BENIGN"?"var(--accent-emerald)":"var(--accent-amber)",i=t.truth==="PATHOGENIC"?"rgba(244, 63, 94, 0.08)":t.truth==="BENIGN"?"rgba(16, 185, 129, 0.08)":"rgba(245, 158, 11, 0.08)";return`
      <div class="glass-panel" style="padding: 0.6rem 0.8rem; cursor: pointer; border-color: ${a?"var(--accent-indigo)":"var(--panel-border)"}; background: ${a?"rgba(99,102,241,0.08)":"var(--panel-bg)"}; gap: 0.25rem;" onclick="window.selectVariant('${t.variant.replace(/'/g,"\\'")}')">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${t.variant}</span>
          <span style="font-size: 0.65rem; border: 1px solid ${n}; background: ${i}; color: ${n}; padding: 0.05rem 0.35rem; border-radius: 4px; font-weight: 700; font-family: var(--font-mono);">${t.truth}</span>
        </div>
      </div>
    `}).join("")}function x(e){let o=e.pvs1?1:0,t=e.ps1?1:0,a=e.pm2?1:0,n=e.pp3?1:0,i=e.ba1?1:0,r=e.bs1?1:0,c=e.bp4?1:0;return i>=1?"BENIGN (Stand-alone)":r>=2?"BENIGN (Strong)":r>=1&&c>=1||c>=2?"LIKELY BENIGN":o===1&&(t>=1||a>=2||a===1&&n===1||n>=2)||t>=2||t===1&&(a>=3||a===2&&n>=2||a===1&&n>=4)?"PATHOGENIC":o===1&&a===1||t===1&&(a===1||a===2)||t===1&&n>=2||a>=3||a===2&&n>=2||a===1&&n>=4?"LIKELY PATHOGENIC":(o>0||t>0||a>0||n>0)&&(i>0||r>0||c>0)?"VUS (CONFLICTING)":o>0||t>0||a>0||n>0?"VUS (INSUFFICIENT)":"VUS"}function y(e){g=e,A();const o={pvs1:e.truth==="PATHOGENIC"&&e.bundle.domain.toLowerCase().includes("frameshift"),pm2:e.bundle.pop_af.toLowerCase().includes("af < 0.00001"),pp3:e.truth==="PATHOGENIC",ba1:e.bundle.pop_af.toLowerCase().includes("af = 0.18")||e.bundle.pop_af.toLowerCase().includes("af = 0.034"),bs1:e.truth==="BENIGN",bp4:e.truth==="BENIGN"},t=()=>{const m={pvs1:document.getElementById("c-pvs1").checked,ps1:document.getElementById("c-ps1").checked,pm2:document.getElementById("c-pm2").checked,pp3:document.getElementById("c-pp3").checked,ba1:document.getElementById("c-ba1").checked,bs1:document.getElementById("c-bs1").checked,bp4:document.getElementById("c-bp4").checked},p=x(m),s=document.getElementById("calc-class");s.innerText=p,p.includes("PATHOGENIC")?(s.style.color="var(--accent-rose)",s.style.borderColor="var(--accent-rose)",s.style.background="rgba(244, 63, 94, 0.08)"):p.includes("BENIGN")?(s.style.color="var(--accent-emerald)",s.style.borderColor="var(--accent-emerald)",s.style.background="rgba(16, 185, 129, 0.08)"):(s.style.color="var(--accent-amber)",s.style.borderColor="var(--accent-amber)",s.style.background="rgba(245, 158, 11, 0.08)")},a=e.bundle.pop_af.toLowerCase(),n=a.includes("af < 0.00001")||a.includes("absent"),i=n?"Extremely Rare (High Risk)":"Common Allele (Low Risk)",r=n?"var(--accent-rose)":"var(--accent-emerald)",c=n?"rgba(244, 63, 94, 0.08)":"rgba(16, 185, 129, 0.08)";P.innerHTML=`
    <h2 class="panel-title">2. Clinical Case File: ${e.variant}</h2>
    
    <div class="grid-2col" style="gap: 0.75rem; font-size: 0.8rem;">
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Gene Target</span><br/>
        <span style="color: var(--text-primary); font-weight: 600;">${e.bundle.gene_context}</span>
      </div>
      <div style="background: ${c}; border: 1px solid ${r}; padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Population Frequency</span><br/>
        <span style="color: ${r}; font-weight: 700;">${e.bundle.pop_af} (${i})</span>
      </div>
    </div>

    <div class="grid-2col" style="gap: 0.75rem; font-size: 0.8rem;">
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">ClinVar Database</span><br/>
        <span style="color: var(--text-primary); font-weight: 500;">${e.bundle.clinvar_summary}</span>
      </div>
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--panel-border); padding: 0.6rem; border-radius: 4px;">
        <span style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">Functional Domain Impact</span><br/>
        <span style="color: var(--text-primary); font-weight: 500;">${e.bundle.domain}</span>
      </div>
    </div>

    <div style="border-top: 1px solid var(--panel-border); padding-top: 0.85rem; margin-top: 0.25rem;">
      <h4 style="font-family: var(--font-header); font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.5rem;">ACMG Classification Rules Grid</h4>
      
      <div class="grid-2col" style="font-size: 0.8rem;">
        <div>
          <span style="font-weight: 700; color: var(--accent-rose); display: block; margin-bottom: 0.35rem; font-size: 0.75rem; text-transform: uppercase;">Pathogenic Criteria</span>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-pvs1" ${o.pvs1?"checked":""} />
              <span>PVS1 (Strong Null Variant)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-ps1"  />
              <span>PS1 (Strong Amino Acid Match)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-pm2" ${o.pm2?"checked":""} />
              <span>PM2 (Moderate Pop Absent)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-pp3" ${o.pp3?"checked":""} />
              <span>PP3 (Supporting Predictor)</span>
            </label>
          </div>
        </div>

        <div>
          <span style="font-weight: 700; color: var(--accent-emerald); display: block; margin-bottom: 0.35rem; font-size: 0.75rem; text-transform: uppercase;">Benign Criteria</span>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-ba1" ${o.ba1?"checked":""} />
              <span>BA1 (Stand-alone Frequency > 5%)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-bs1" ${o.bs1?"checked":""} />
              <span>BS1 (Strong High Frequency)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" id="c-bp4" ${o.bp4?"checked":""} />
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
  `,["c-pvs1","c-ps1","c-pm2","c-pp3","c-ba1","c-bs1","c-bp4"].forEach(m=>{document.getElementById(m).addEventListener("change",t)}),t()}window.selectVariant=e=>{const o=u.find(t=>t.variant===e);o&&y(o)};h.addEventListener("input",A);y(g);const v='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',b='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';function G(){const e=document.getElementById("theme-toggle");localStorage.getItem("theme")==="dark"?(document.documentElement.classList.add("dark"),e&&(e.innerHTML=v)):(document.documentElement.classList.remove("dark"),e&&(e.innerHTML=b))}G();const d=document.getElementById("theme-toggle");d&&d.addEventListener("click",()=>{document.documentElement.classList.contains("dark")?(document.documentElement.classList.remove("dark"),localStorage.setItem("theme","light"),d.innerHTML=b):(document.documentElement.classList.add("dark"),localStorage.setItem("theme","dark"),d.innerHTML=v)});
