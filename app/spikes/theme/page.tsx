'use client';

import { useEffect, useState } from 'react';

type Theme = 'day' | 'night';

const TOKENS = [
  { name: 'paper', day: '#f6efe0', night: '#1a1410' },
  { name: 'paper-2', day: '#f0e7d4', night: '#221a14' },
  { name: 'paper-3', day: '#e9deb9', night: '#2c2218' },
  { name: 'ink', day: '#2c2418', night: '#e8dcc4' },
  { name: 'ink-mute', day: '#8a7a5e', night: '#9a8a6e' },
  { name: 'ink-faint', day: '#bfb094', night: '#5a4e3a' },
  { name: 'rule-blue', day: '#a8c3d9', night: '#3a4a5a' },
  { name: 'rule-pink', day: '#d89090', night: '#5a3a3a' },
  { name: 'pen-navy', day: '#1f3a5f', night: '#7ab0e0' },
  { name: 'pen-navy-deep', day: '#142844', night: '#5e8bbe' },
  { name: 'stamp-red', day: '#b02a2a', night: '#e06060' },
  { name: 'stamp-red-fade', day: '#c46b6b', night: '#c26060' },
  { name: 'pencil-gray', day: '#6b6055', night: '#807565' },
  { name: 'highlighter', day: '#ffe88a', night: '#5a4e1a' },
  { name: 'coffee-stain', day: '#a07a4a', night: '#6b5230' },
  { name: 'seal-gold', day: '#a68a3b', night: '#d4b35a' },
];

export default function ThemeSpike() {
  const [theme, setTheme] = useState<Theme>('day');

  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', theme);

    // Inject Paper Ledger palette variables into :root. The spike layout and
    // this page both consume them via var(--color-*, fallback). Phase 1.1 will
    // replace this runtime injection with CSS written once in globals.css.
    const cssVars = TOKENS.map(
      (t) => `--color-${t.name}: ${theme === 'day' ? t.day : t.night};`,
    ).join(' ');
    const style = document.createElement('style');
    style.id = 'spike-theme-vars';
    style.textContent = `:root { ${cssVars} }`;
    document.getElementById('spike-theme-vars')?.remove();
    document.head.appendChild(style);

    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev);
      else document.documentElement.removeAttribute('data-theme');
      document.getElementById('spike-theme-vars')?.remove();
    };
  }, [theme]);

  const bgColor = theme === 'day' ? '#f6efe0' : '#1a1410';
  const fgColor = theme === 'day' ? '#2c2418' : '#e8dcc4';

  return (
    <div className="mx-auto max-w-4xl" style={{ color: fgColor }}>
      <header className="mb-6 font-serif">
        <h1 className="text-3xl font-bold">S5 · Day ↔ Midnight theme</h1>
        <p className="mt-2 text-[15px] leading-[1.55]" style={{ color: fgColor, opacity: 0.7 }}>
          Toggles <code className="font-mono text-[13px]">data-theme</code> on{' '}
          <code className="font-mono text-[13px]">&lt;html&gt;</code>. Every Paper Ledger token
          should swap via CSS variables only — zero conditional rendering.
        </p>
      </header>

      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setTheme('day')}
          className="border border-current px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em]"
          style={{
            background: theme === 'day' ? fgColor : 'transparent',
            color: theme === 'day' ? bgColor : fgColor,
          }}
        >
          Day — Daybook
        </button>
        <button
          onClick={() => setTheme('night')}
          className="border border-current px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em]"
          style={{
            background: theme === 'night' ? fgColor : 'transparent',
            color: theme === 'night' ? bgColor : fgColor,
          }}
        >
          Night — Midnight Ledger
        </button>
      </div>

      <section className="mb-10">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em]">
          Palette — current theme: {theme}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-[12px]">
          {TOKENS.map((t) => (
            <div key={t.name} className="flex items-center gap-3 border-b border-current/20 py-1.5">
              <span
                className="h-6 w-6 shrink-0 border border-current/40"
                style={{ background: theme === 'day' ? t.day : t.night }}
              />
              <span className="w-36 shrink-0">{t.name}</span>
              <span className="opacity-60">{theme === 'day' ? t.day : t.night}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em]">
          Preview — a composed row
        </div>
        <div
          className="p-6"
          style={{
            background: bgColor,
            border: `1px solid ${theme === 'day' ? '#2c2418' : '#e8dcc4'}40`,
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: theme === 'day' ? '#8a7a5e' : '#9a8a6e' }}>
            Mon, 20 Apr 2026 · Page 16/52
          </div>
          <div className="mt-2 font-serif text-3xl font-bold">11.800.000 ₫</div>
          <div className="mt-1" style={{ color: theme === 'day' ? '#1f3a5f' : '#7ab0e0', fontFamily: 'var(--font-hand), cursive', fontSize: 22 }}>
            Phở bò — Cà phê sữa đá
          </div>
        </div>
      </section>

      <section className="border-t-2 pt-6 font-serif" style={{ borderColor: fgColor }}>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.15em]">Verdict checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px]">
          <li>Toggle swaps every token instantly; no flash of un-themed content.</li>
          <li>
            Every pair (day/night) hits WCAG AA for text uses — verify with axe in Phase 7.
          </li>
          <li>
            <strong>next-themes compat plan:</strong>{' '}
            <code className="font-mono text-[13px]">
              &lt;ThemeProvider attribute=&quot;data-theme&quot; value=&#123;&#123; light: &apos;day&apos;, dark: &apos;night&apos; &#125;&#125; /&gt;
            </code>
            . Implement in Phase 1.1.
          </li>
        </ul>
      </section>
    </div>
  );
}
