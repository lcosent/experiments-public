import type { ReactNode } from 'react';

export const metadata = {
  title: 'machine-payments',
  description: 'Agent-to-agent compute marketplace PoC',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23bc8cff'/%3E%3Cstop offset='100%25' stop-color='%2358a6ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M20 15 L65 50 L20 85' fill='none' stroke='url(%23g)' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cline x1='52' y1='85' x2='85' y2='85' stroke='url(%23g)' stroke-width='18' stroke-linecap='round'/%3E%3C/svg%3E?v=3" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f6f8fa;
            --border-color: rgba(0, 0, 0, 0.08);
            --text-primary: #1f2328;
            --text-secondary: #4b5563;
            --text-muted: #8c959f;
            --color-success: #1a7f37;
            --color-brand: #0969da;
          }
          html.dark, .dark {
            --bg-primary: #0b0f19;
            --bg-secondary: #0f172a;
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f3f4f6;
            --text-secondary: #d1d5db;
            --text-muted: #6b7280;
            --color-success: #34d399;
            --color-brand: #818cf8;
          }
          html, body {
            overflow-x: hidden;
          }
          .theme-toggle-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            transition: color 0.2s ease, transform 0.2s ease;
            outline: none;
          }
          .theme-toggle-btn:hover {
            color: var(--text-primary);
            transform: scale(1.1);
          }
          @media (max-width: 768px) {
            .simulator-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 600px) {
            .status-bar {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 0.5rem !important;
              padding: 0.6rem 1rem !important;
            }
            .status-left {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 0.25rem !important;
            }
          }
          @media (max-width: 576px) {
            .cli-widget {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 0.5rem !important;
              width: 100% !important;
            }
            .cli-code {
              overflow-x: auto !important;
              white-space: nowrap !important;
              padding-bottom: 4px !important;
              max-width: 100% !important;
            }
          }
          @media (max-width: 480px) {
            .container-padding {
              padding: 0 1rem 2rem 1rem !important;
            }
            h1 {
              font-size: 1.5rem !important;
            }
            footer {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 1rem !important;
            }
          }
        ` }} />
      </head>
      <body
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          margin: 0,
          padding: 0,
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
