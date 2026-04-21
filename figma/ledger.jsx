// Style 4 — PAPER LEDGER (Tactile / skeuomorphic)
// Warm cream paper with ruled blue lines, printed tabular form,
// handwritten annotations (Caveat) in navy ink, red stamp accent,
// torn edges/tape hints. Feels like a hand-kept sổ thu chi.

const LG = {
  paper:   '#f6efe0',
  paper2:  '#f0e7d4',
  ruleBlue:'#a8c3d9',
  rulePink:'#d89090',
  ink:     '#2c2418',
  navy:    '#1f3a5f',   // pen ink
  red:     '#b02a2a',   // red stamp
  mute:    '#8a7a5e',
  serif:   '"Crimson Pro", "Fraunces", Georgia, serif',
  typewriter: '"Courier Prime", "Courier New", monospace',
  hand:    '"Caveat", "Segoe Script", cursive',
  stamp:   '"Archivo Black", "Archivo", sans-serif',
};

// Background: ruled notebook lines
const ruledBg = {
  backgroundColor: LG.paper,
  backgroundImage: `
    linear-gradient(${LG.rulePink} 0 1px, transparent 1px 100%),
    repeating-linear-gradient(to bottom, transparent 0 31px, ${LG.ruleBlue} 31px 32px)
  `,
  backgroundPosition: 'left 60px top 0, 0 12px',
  backgroundSize: '1px 100%, 100% 32px',
  backgroundRepeat: 'no-repeat, repeat',
};

function LedgerDashboard() {
  const d = EXPENSE_DATA;
  const maxDay = Math.max(...d.daily.map(x => x.amount));

  return (
    <div style={{
      width: 1440, height: 900, ...ruledBg, color: LG.ink,
      fontFamily: LG.serif, fontSize: 14, position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* tape strips (top corners) */}
      <div style={{ position: 'absolute', top: -8, left: 120, width: 110, height: 28, background: 'rgba(220, 200, 140, 0.55)', transform: 'rotate(-3deg)', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}/>
      <div style={{ position: 'absolute', top: -8, right: 180, width: 130, height: 26, background: 'rgba(220, 200, 140, 0.55)', transform: 'rotate(2deg)', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}/>

      {/* printed header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', padding: '30px 80px 10px', borderBottom: `2px solid ${LG.ink}`, gap: 20 }}>
        <div>
          <div style={{ fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: LG.mute }}>SỔ THU CHI · PERSONAL EXPENSES · FORM CHN-01</div>
          <div style={{ fontFamily: LG.serif, fontSize: 36, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>Daily Ledger <span style={{ fontFamily: LG.hand, fontWeight: 400, color: LG.navy, fontSize: 32 }}>— week of Apr 14</span></div>
        </div>
        <div style={{ flex: 1 }} />
        {/* nav as file tabs */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, fontFamily: LG.typewriter, fontSize: 11, letterSpacing: 1 }}>
          {[['LEDGER', true], ['RECURRING', false], ['CHAT', false], ['OUT', false]].map(([t, a], i) => (
            <div key={t} style={{
              padding: '6px 14px 5px',
              background: a ? LG.paper : LG.paper2,
              border: `1px solid ${LG.ink}`, borderBottom: a ? 'none' : `1px solid ${LG.ink}`,
              borderRadius: '4px 4px 0 0',
              fontWeight: a ? 700 : 400,
              color: a ? LG.ink : LG.mute,
              marginBottom: a ? -1 : 0,
            }}>{t}</div>
          ))}
        </div>
      </div>

      {/* red date stamp */}
      <div style={{ position: 'absolute', top: 42, right: 80, transform: 'rotate(-6deg)', border: `2px solid ${LG.red}`, padding: '4px 10px 3px', color: LG.red, fontFamily: LG.stamp, fontSize: 11, letterSpacing: 1.5, opacity: 0.78, background: 'transparent' }}>
        APR · 20 · 2026
        <div style={{ fontFamily: LG.typewriter, fontSize: 8, letterSpacing: 2, marginTop: 2 }}>RECEIVED</div>
      </div>

      {/* body grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', flex: 1, minHeight: 0 }}>
        {/* LEFT */}
        <div style={{ padding: '20px 40px 20px 80px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0 }}>
          {/* Hero — total in printed box, handwritten caption */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 2.5, color: LG.mute, textTransform: 'uppercase' }}>LINE A. — Total spent, week to date</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 2 }}>
              <div style={{ fontFamily: LG.serif, fontSize: 84, fontWeight: 700, lineHeight: 1, letterSpacing: -2, fontVariantNumeric: 'oldstyle-nums' }}>
                {vndDot(d.net)}<span style={{ fontSize: 24, color: LG.mute, marginLeft: 6 }}>₫</span>
              </div>
              <div style={{ fontFamily: LG.hand, fontSize: 26, color: LG.navy, transform: 'rotate(-3deg)', lineHeight: 1 }}>
                net, after Mai paid me back 👍
              </div>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 10, fontFamily: LG.typewriter, fontSize: 12, color: LG.ink }}>
              <div>gross: <b>{vndDot(d.total)} ₫</b></div>
              <div>returned: <span style={{ color: LG.red }}>−{vndDot(d.paybacks)} ₫</span></div>
              <div style={{ fontFamily: LG.hand, fontSize: 18, color: LG.navy }}>↑ a bit over last wk</div>
            </div>
          </div>

          {/* Chart — bars drawn like a hand-sketched plot */}
          <div style={{ border: `1px solid ${LG.ink}`, padding: '14px 18px 10px', background: 'rgba(255,255,255,0.35)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: 16, background: LG.paper, padding: '0 8px', fontFamily: LG.typewriter, fontSize: 11, letterSpacing: 2 }}>FIG. 1 — DAILY</div>
            <svg viewBox="0 0 600 160" style={{ width: '100%', height: 160 }}>
              {/* hand-drawn baseline */}
              <line x1={20} x2={590} y1={130} y2={130} stroke={LG.ink} strokeWidth={1.5} strokeLinecap="round" />
              {d.daily.map((day, i) => {
                const x = 30 + i * 80;
                const h = (day.amount / maxDay) * 100;
                const active = i === 5;
                return (
                  <g key={i}>
                    {/* pencil-sketched bar */}
                    <rect x={x} y={130 - h} width={52} height={h}
                      fill={active ? 'rgba(176,42,42,0.15)' : 'rgba(31,58,95,0.1)'}
                      stroke={active ? LG.red : LG.navy} strokeWidth={1.5} />
                    <text x={x + 26} y={130 - h - 6} fontFamily={LG.hand} fontSize={18} fill={active ? LG.red : LG.navy} textAnchor="middle">
                      {(day.amount/1000).toFixed(0)}k
                    </text>
                    <text x={x + 26} y={148} fontFamily={LG.typewriter} fontSize={10} fill={LG.ink} textAnchor="middle" letterSpacing={1}>{day.day.toUpperCase()}</text>
                  </g>
                );
              })}
              {/* circled peak */}
              <ellipse cx={436} cy={65} rx={36} ry={14} fill="none" stroke={LG.red} strokeWidth={1.5} strokeDasharray="3 2" />
              <line x1={472} y1={58} x2={520} y2={40} stroke={LG.red} strokeWidth={1.2} />
              <text x={522} y={38} fontFamily={LG.hand} fontSize={18} fill={LG.red}>ouch — Uniqlo</text>
            </svg>
          </div>

          {/* Ledger table */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 60px 1fr 100px 110px', fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 2, color: LG.ink, padding: '4px 8px', borderTop: `2px solid ${LG.ink}`, borderBottom: `1px solid ${LG.ink}`, background: LG.paper2 }}>
              <div>DATE</div><div>TIME</div><div>DESCRIPTION / NOTES</div><div>CATEGORY</div><div style={{ textAlign: 'right' }}>AMT. (₫)</div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {d.transactions.slice(0, 7).map((t, i) => (
                <div key={t.id} style={{
                  display: 'grid', gridTemplateColumns: '60px 60px 1fr 100px 110px',
                  alignItems: 'baseline', height: 32, padding: '0 8px',
                  borderBottom: `1px solid ${LG.ruleBlue}`, fontSize: 14,
                }}>
                  <div style={{ fontFamily: LG.typewriter, fontSize: 12, color: LG.mute }}>{t.date}</div>
                  <div style={{ fontFamily: LG.typewriter, fontSize: 12, color: LG.mute }}>{t.time}</div>
                  <div style={{ fontFamily: i === 4 ? LG.hand : LG.serif, fontSize: i === 4 ? 18 : 14, color: i === 4 ? LG.navy : LG.ink }}>
                    {t.desc}
                    {t.note && <span style={{ fontFamily: LG.hand, color: LG.red, marginLeft: 10, fontSize: 17 }}>({t.note})</span>}
                  </div>
                  <div style={{ fontFamily: LG.typewriter, fontSize: 11, color: LG.mute, letterSpacing: 1, textTransform: 'uppercase' }}>{t.cat}</div>
                  <div style={{ textAlign: 'right', fontVariantNumeric: 'oldstyle-nums tabular-nums', fontWeight: 700, color: t.refund ? LG.red : LG.ink }}>
                    {t.refund ? '(' : ''}{vndDot(t.amount)}{t.refund ? ')' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ padding: '20px 80px 20px 30px', borderLeft: `1px dashed ${LG.ink}`, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* overview mini-cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              ['entries', d.txCount, ''],
              ['daily avg', vndDot(d.dailyAvg), '₫'],
              ['top cat.', 'Food', '43%'],
            ].map(([k, v, u], i) => (
              <div key={k} style={{ border: `1px solid ${LG.ink}`, padding: '8px 10px', background: 'rgba(255,255,255,0.4)' }}>
                <div style={{ fontFamily: LG.typewriter, fontSize: 9, letterSpacing: 1.5, color: LG.mute, textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontFamily: LG.serif, fontSize: 22, fontWeight: 700, fontVariantNumeric: 'oldstyle-nums' }}>{v}<span style={{ fontSize: 12, color: LG.mute, marginLeft: 3 }}>{u}</span></div>
              </div>
            ))}
          </div>

          {/* category — tally marks */}
          <div>
            <div style={{ fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 2.5, color: LG.mute, textTransform: 'uppercase', marginBottom: 6 }}>LINE B. — by category</div>
            {d.categories.map((c, i) => (
              <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px', alignItems: 'baseline', padding: '6px 0', borderBottom: `1px dotted ${LG.mute}`, fontSize: 14 }}>
                <span style={{ color: LG.ink }}>{c.name}</span>
                <span style={{ fontFamily: LG.hand, fontSize: 24, color: LG.navy, letterSpacing: 2, lineHeight: 0.8 }}>
                  {Array.from({ length: Math.round(c.pct / 4) }, (_, k) => (k + 1) % 5 === 0 ? '/' : '|').join('')}
                </span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'oldstyle-nums tabular-nums', fontWeight: 700 }}>{vndDot(c.amount)} ₫</span>
              </div>
            ))}
          </div>

          {/* add form — like a pink carbon slip */}
          <div style={{ background: '#f7d8d0', border: `1px solid ${LG.red}`, padding: '12px 14px', position: 'relative', transform: 'rotate(0.5deg)' }}>
            <div style={{ fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 2.5, color: LG.red, marginBottom: 8 }}>FORM CHN-01-A · QUICK ENTRY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: 8, fontFamily: LG.typewriter, fontSize: 12 }}>
              <span>amount:</span><div style={{ borderBottom: `1px solid ${LG.ink}`, paddingBottom: 2, fontFamily: LG.hand, fontSize: 20, color: LG.navy, lineHeight: 1 }}>140.000 ₫</div>
              <span>category:</span><div style={{ borderBottom: `1px solid ${LG.ink}`, paddingBottom: 2, fontFamily: LG.hand, fontSize: 20, color: LG.navy, lineHeight: 1 }}>Food</div>
              <span>desc.:</span><div style={{ borderBottom: `1px solid ${LG.ink}`, paddingBottom: 2, fontFamily: LG.hand, fontSize: 20, color: LG.navy, lineHeight: 1 }}>Pho Thin — lunch</div>
            </div>
            <div style={{ marginTop: 10, fontFamily: LG.stamp, fontSize: 11, letterSpacing: 2, border: `2px solid ${LG.ink}`, padding: '6px 10px', background: LG.paper, textAlign: 'center' }}>
              RECORD &nbsp;→
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: '6px 80px', borderTop: `2px solid ${LG.ink}`, display: 'flex', justifyContent: 'space-between', fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 2, color: LG.mute, textTransform: 'uppercase' }}>
        <span>pg. 16 / 52</span>
        <span style={{ fontFamily: LG.hand, fontSize: 16, color: LG.navy, letterSpacing: 0, textTransform: 'none' }}>— balanced ✓</span>
        <span>initials ___</span>
      </div>
    </div>
  );
}

function LedgerChat() {
  const d = EXPENSE_DATA;
  return (
    <div style={{
      width: 900, height: 900, ...ruledBg, color: LG.ink,
      fontFamily: LG.serif, fontSize: 15, display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: -6, left: 80, width: 120, height: 24, background: 'rgba(220,200,140,0.55)', transform: 'rotate(-2deg)' }}/>

      <div style={{ padding: '24px 80px 10px', borderBottom: `2px solid ${LG.ink}` }}>
        <div style={{ fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 3, color: LG.mute, textTransform: 'uppercase' }}>FORM CHN-02 · correspondence with accountant</div>
        <div style={{ fontFamily: LG.serif, fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Dear <span style={{ fontFamily: LG.hand, fontWeight: 400, color: LG.navy }}>Ledger-keeper</span>,</div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '20px 80px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {d.chat.map((m, i) => (
          <div key={i}>
            {m.role === 'user' ? (
              <div style={{ fontFamily: LG.hand, fontSize: 28, color: LG.navy, lineHeight: 1.1, transform: i === 0 ? 'rotate(-0.3deg)' : 'rotate(0.2deg)' }}>
                — {m.text}
              </div>
            ) : (
              <div style={{ paddingLeft: 16, borderLeft: `2px solid ${LG.ink}` }}>
                <div style={{ fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 2, color: LG.mute, textTransform: 'uppercase', marginBottom: 6 }}>— reply, typed —</div>
                <div style={{ fontFamily: LG.typewriter, fontSize: 14, lineHeight: 1.55, color: LG.ink }}>{m.text}</div>
                {m.tool && (
                  <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.55)', border: `1px dashed ${LG.navy}`, padding: '10px 14px' }}>
                    <div style={{ fontFamily: LG.typewriter, fontSize: 9, letterSpacing: 2, color: LG.mute, textTransform: 'uppercase', marginBottom: 4 }}>consulted: the book</div>
                    <pre style={{ margin: 0, fontFamily: LG.typewriter, fontSize: 11.5, whiteSpace: 'pre-wrap', color: LG.navy }}>{m.tool.sql}</pre>
                    <div style={{ marginTop: 6, fontFamily: LG.hand, fontSize: 22, color: LG.red, transform: 'rotate(-1deg)' }}>
                      → {m.tool.result} ✓
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div style={{ fontFamily: LG.hand, fontSize: 22, color: LG.mute }}>— penning reply…</div>
      </div>

      <div style={{ borderTop: `2px solid ${LG.ink}`, padding: '16px 80px', background: 'rgba(255,255,255,0.2)' }}>
        <div style={{ fontFamily: LG.typewriter, fontSize: 10, letterSpacing: 2, color: LG.mute, textTransform: 'uppercase', marginBottom: 4 }}>your message:</div>
        <div style={{ borderBottom: `1px solid ${LG.ink}`, paddingBottom: 8, fontFamily: LG.hand, fontSize: 28, color: LG.navy, minHeight: 36 }}>
          &nbsp;
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: LG.typewriter, fontSize: 11, letterSpacing: 1.5, color: LG.mute, textTransform: 'uppercase' }}>
          <span>signed, ____________</span>
          <span>▸ post</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LedgerDashboard, LedgerChat });
