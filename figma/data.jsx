// Shared mock data for all styles. VND amounts.
const EXPENSE_DATA = {
  range: { label: 'Last 7 days', from: 'Apr 14', to: 'Apr 20', year: 2026 },
  total: 4_287_000,           // VND
  paybacks: 650_000,          // got back
  net: 3_637_000,
  txCount: 34,
  dailyAvg: 612_428,
  topCategory: { name: 'Food & Drink', amount: 1_840_000, pct: 43 },

  // 7 days
  daily: [
    { day: 'Mon', date: 'Apr 14', amount: 420_000, breakdown: [['Food', 180_000], ['Transit', 60_000], ['Misc', 180_000]] },
    { day: 'Tue', date: 'Apr 15', amount: 685_000, breakdown: [['Food', 240_000], ['Shopping', 350_000], ['Transit', 95_000]] },
    { day: 'Wed', date: 'Apr 16', amount: 312_000, breakdown: [['Food', 120_000], ['Coffee', 95_000], ['Transit', 97_000]] },
    { day: 'Thu', date: 'Apr 17', amount: 890_000, breakdown: [['Bills', 450_000], ['Food', 280_000], ['Misc', 160_000]] },
    { day: 'Fri', date: 'Apr 18', amount: 540_000, breakdown: [['Food', 220_000], ['Drinks', 200_000], ['Transit', 120_000]] },
    { day: 'Sat', date: 'Apr 19', amount: 1_180_000, breakdown: [['Shopping', 680_000], ['Food', 340_000], ['Entertainment', 160_000]] },
    { day: 'Sun', date: 'Apr 20', amount: 260_000, breakdown: [['Food', 140_000], ['Coffee', 60_000], ['Transit', 60_000]] },
  ],

  categories: [
    { name: 'Food & Drink', amount: 1_840_000, pct: 43 },
    { name: 'Shopping',     amount: 1_030_000, pct: 24 },
    { name: 'Bills',        amount:   580_000, pct: 14 },
    { name: 'Transit',      amount:   432_000, pct: 10 },
    { name: 'Entertainment',amount:   245_000, pct:  6 },
    { name: 'Other',        amount:   160_000, pct:  3 },
  ],

  transactions: [
    { id: 1, date: 'Apr 20', time: '19:42', desc: 'Pho Thin — dinner',            cat: 'Food',    amount:  140_000 },
    { id: 2, date: 'Apr 20', time: '09:15', desc: 'Grab to office',               cat: 'Transit', amount:   60_000 },
    { id: 3, date: 'Apr 19', time: '21:08', desc: 'The Coffee House — flat white',cat: 'Coffee',  amount:   65_000 },
    { id: 4, date: 'Apr 19', time: '15:30', desc: 'Uniqlo — shirt + tee',         cat: 'Shopping',amount:  680_000 },
    { id: 5, date: 'Apr 19', time: '13:00', desc: 'Lunch w/ Mai',                 cat: 'Food',    amount:  185_000, note: 'split, got 185k back', refund: true },
    { id: 6, date: 'Apr 19', time: '11:22', desc: 'CGV — Late Night w/ the Devil',cat: 'Enter.',  amount:  160_000 },
    { id: 7, date: 'Apr 18', time: '22:10', desc: 'Pasteur Street — beers',       cat: 'Drinks',  amount:  200_000 },
    { id: 8, date: 'Apr 18', time: '12:45', desc: 'Bun cha @ Dac Kim',            cat: 'Food',    amount:  120_000 },
    { id: 9, date: 'Apr 17', time: '17:00', desc: 'Electric bill — April',        cat: 'Bills',   amount:  450_000 },
    { id: 10,date: 'Apr 17', time: '08:30', desc: 'Xoi xeo — breakfast',          cat: 'Food',    amount:   40_000 },
  ],

  chat: [
    { role: 'user',      text: 'how much did I spend on food this week?' },
    { role: 'assistant', text: "You've spent 1,840,000 ₫ on food so far this week — that's 43% of all spending and ~15% more than last week.",
      tool: { name: 'executeSQL',
              sql: "SELECT SUM(amount) FROM expenses\nWHERE category = 'food'\n  AND date >= date('now', '-7 days');",
              result: '1,840,000 ₫' } },
    { role: 'user',      text: 'log lunch today, 140k at pho thin' },
    { role: 'assistant', text: "Logged 140,000 ₫ — Pho Thin, category: Food, Apr 20.",
      tool: { name: 'executeSQL',
              sql: "INSERT INTO expenses (description, category, amount, date)\nVALUES ('Pho Thin — lunch', 'food', 140000, '2026-04-20');",
              result: '1 row inserted · id=1247' } },
    { role: 'user',      text: 'what was my most expensive day?' },
  ],
};

// Format VND. mode: 'full' → 1,180,000 ₫ · 'short' → 1.18M ₫ · 'bare' → 1,180,000
const vnd = (n, mode = 'full') => {
  if (mode === 'short') {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
    if (n >= 1_000)     return Math.round(n / 1_000) + 'k';
    return String(n);
  }
  const s = Math.round(n).toLocaleString('en-US'); // 1,180,000
  if (mode === 'bare') return s;
  return s + ' ₫';
};

// VN-style dotted grouping: 1.180.000
const vndDot = (n) => Math.round(n).toLocaleString('de-DE');

Object.assign(window, { EXPENSE_DATA, vnd, vndDot });
