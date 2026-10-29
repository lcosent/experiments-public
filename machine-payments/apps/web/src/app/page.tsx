"use client";

import { useState, useEffect } from 'react';
import NetworkSimulator from '../components/NetworkSimulator';

export default function HomePage() {
  const [devMode, setDevMode] = useState(false);
  const [copyText, setCopyText] = useState('Copy');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';
    if (isDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const sunIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );

  const moonIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );

  const handleCopy = () => {
    navigator.clipboard.writeText('git clone https://github.com/lcosent/experiments-public.git');
    setCopyText('Copied!');
    setTimeout(() => setCopyText('Copy'), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '15px' }}>
      {/* Minimal Status Bar */}
      <div className="status-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.6rem 1.25rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        background: 'var(--bg-secondary)'
      }}>
        <div className="status-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="https://cosentino.me" style={{ color: 'var(--color-brand)', textDecoration: 'none', transition: 'color 0.15s' }}>
            <span style={{ color: 'var(--text-muted)' }}>[</span>← cosentino.me<span style={{ color: 'var(--text-muted)' }}>]</span>
          </a>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>machine-payments v0.1 · live</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Developer Mode</span>
            <span style={{ color: devMode ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: 'bold' }}>
              {devMode ? '[x]' : '[ ]'}
            </span>
            <input type="checkbox" checked={devMode} onChange={() => setDevMode(!devMode)} style={{ display: 'none' }} />
          </label>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Dark Mode">
            {theme === 'dark' ? sunIcon : moonIcon}
          </button>
        </div>
      </div>

      <div className="container-padding" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          margin: '2rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
              <span style={{ color: 'var(--text-muted)' }}># </span>machine-payments
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 300, marginTop: '0.5rem', margin: 0, maxWidth: 700 }}>
              Machine-to-machine payment library in TypeScript. Escrow and settle micropayments programmatically between autonomous compute agents.
            </p>
          </div>
          <div className="cli-widget" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 0,
            padding: '0.4rem 0.6rem',
            fontSize: '0.7rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <span className="cli-code" style={{ color: 'var(--color-success)' }}>git clone https://github.com/lcosent/experiments-public.git</span>
            <button onClick={handleCopy} style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-brand)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'color 0.15s',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <span style={{ color: 'var(--text-muted)' }}>[</span>{copyText}<span style={{ color: 'var(--text-muted)' }}>]</span>
            </button>
          </div>
        </header>

        <section style={{ margin: '1rem 0' }}>
          <NetworkSimulator devMode={devMode} />
        </section>

        {devMode && (
          <section style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              <span style={{ color: 'var(--color-brand)' }}>## </span>API Endpoints Documentation
            </h2>
            <ul style={{ lineHeight: 2.0, color: 'var(--text-secondary)', fontSize: '0.8rem', paddingLeft: 0, listStyle: 'none' }}>
              <li style={{ position: 'relative', paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--text-muted)', fontWeight: 'bold' }}>-</span>
                <code style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: 0 }}>POST /api/providers/dcomp/quote</code> — Quote a USDC-escrow compute job.
              </li>
              <li style={{ position: 'relative', paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--text-muted)', fontWeight: 'bold' }}>-</span>
                <code style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: 0 }}>POST /api/providers/dcomp/start</code> — Open a job against an MPP intent hash.
              </li>
              <li style={{ position: 'relative', paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--text-muted)', fontWeight: 'bold' }}>-</span>
                <code style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: 0 }}>GET /api/providers/dcomp/meter?job_id=...</code> — Poll meter ticks.
              </li>
              <li style={{ position: 'relative', paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--text-muted)', fontWeight: 'bold' }}>-</span>
                <code style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: 0 }}>POST /api/providers/dcomp/settle</code> — Sign final settlement.
              </li>
            </ul>
          </section>
        )}

        <footer style={{
          marginTop: '4rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>&copy; 2026 Luca Cosentino</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://stablecoin-policy.cosentino.me" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>[</span>stablecoin-policy<span style={{ color: 'var(--text-muted)' }}>]</span>
            </a>
            <a href="https://rsu-tax-optimizer.cosentino.me" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>[</span>rsu-tax-optimizer<span style={{ color: 'var(--text-muted)' }}>]</span>
            </a>
            <a href="https://agent-debate.cosentino.me" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>[</span>agent-debate<span style={{ color: 'var(--text-muted)' }}>]</span>
            </a>
            <a href="https://prompt-eval-arena.cosentino.me" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>[</span>prompt-eval-arena<span style={{ color: 'var(--text-muted)' }}>]</span>
            </a>
            <a href="https://life-scenarios.cosentino.me" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>
              <span style={{ color: 'var(--text-muted)' }}>[</span>life-scenarios<span style={{ color: 'var(--text-muted)' }}>]</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
