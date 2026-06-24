# Idea Backlog — chienpham.com / Paper Ledger

> Output of a 5-member Opus council (2026-06-22). ~24 ideas to grow the expense tracker
> into a personal site, all honoring the Paper Ledger design system.
>
> **Scoring** — each axis 1–10. **Holistic = mean of the five axes.** This is a *pet project*:
> everything is feasible, so feasibility isn't scored. Overengineering is a *plus*, not a cost —
> hence **Craft** rewards technical ambition.
>
> | Axis | Means | Whose reaction |
> |---|---|---|
> | **Joy** | Delight to build + live with daily | *yours* (intrinsic) |
> | **Wow** | The "send this link" jaw-drop in a demo | *a visitor's* (external) |
> | **Useful** | Actual day-to-day value, not spectacle | yours |
> | **Fit** | Extends the Paper Ledger system (vs. fights it) | the system's |
> | **Craft** | Technical ambition / depth — *higher = harder = better* | the engineer's |

---

## Ranked by holistic score

| # | Idea | Joy | Wow | Useful | Fit | Craft | **Holistic** |
|---|---|:--:|:--:|:--:|:--:|:--:|:--:|
| 1 | **Closing the Books** ceremony (rule off → wax-seal → flip to blank month) | 9 | 9 | 8 | 10 | 7 | **8.6** |
| 2 | **Wet Ink** (GPU ink-diffusion as a new entry bleeds onto the page) | 9 | 9 | 5 | 10 | 9 | **8.4** |
| 3 | **The Loupe** (brass magnifier reveals fine-print that only exists under glass) | 9 | 9 | 6 | 9 | 8 | **8.2** |
| 4 | **The Marginalia Hand** (AI writes notes in the gutter in jittered Caveat) | 9 | 9 | 7 | 9 | 7 | **8.2** |
| 5 | **Pressed-Ink Sparklines** (hand-penned charts, not Chart.js) | 8 | 8 | 8 | 10 | 7 | **8.2** |
| 6 | **The Rubber-Stamp Auditor** (agentic loop stamps APPROVED/SUSPICIOUS + arrows) | 9 | 8 | 7 | 9 | 8 | **8.2** |
| 7 | **The Annual Statement** (illuminated broadsheet: drop-cap + L-system vines) | 9 | 9 | 6 | 9 | 8 | **8.2** |
| 8 | **Loose Receipts** (matter.js physics pile — drag, pin, tape, tear) | 9 | 9 | 4 | 9 | 10 | **8.2** |
| 9 | **The Stamped Passport** (`/voyages` — nested page-turn, book-within-book) | 8 | 9 | 5 | 9 | 10 | **8.2** |
| 10 | **Aging Paper** (entries accrete coffee rings / dog-ears / yellowing by age) | 9 | 8 | 6 | 10 | 7 | **8.0** |
| 11 | **The Monthly Letter** (AI-drafted, wax-sealed, break-to-open correspondence) | 9 | 9 | 7 | 9 | 6 | **8.0** |
| 12 | **Paper Curl** (page lifts/curls under cursor, flows into the page-turn) | 8 | 8 | 5 | 10 | 8 | **7.8** |
| 13 | **The Commonplace Book** (`/marginalia` — taped scraps, clippings, quotes) | 8 | 7 | 8 | 9 | 6 | **7.6** |
| 14 | **The Wax-Seal Guestbook** (`/seal` — press-and-hold to sign in molten wax) | 8 | 9 | 5 | 9 | 7 | **7.6** |
| 15 | **Wax-Sealed Mailable Statement** (headless PDF → Lob/PostGrid → real mail) | 8 | 7 | 5 | 9 | 8 | **7.4** |
| 16 | **The Fortune-Teller's Page** (ink-blot divination over a real forecast) | 8 | 8 | 4 | 9 | 7 | **7.2** |
| 17 | **The Punch-Card Habit Tracker** (`/cards` — real hole-punch cutouts, chad debris) | 8 | 8 | 6 | 7 | 7 | **7.2** |
| 18 | **Thermal Receipt Ticker** (ESC/POS printer prints each expense as paper) | 8 | 9 | 4 | 7 | 8 | **7.2** |
| 19 | **The Year, Bound** (print-on-demand physical yearbook of your spending) | 8 | 8 | 4 | 8 | 8 | **7.2** |
| 20 | **The Desk Blotter** (loose ephemera tucked between page-turns) | 8 | 8 | 4 | 9 | 6 | **7.0** |
| 21 | **The Official Dossier** (`/dossier` — CV as stamped, redacted personnel file) | 7 | 7 | 7 | 8 | 6 | **7.0** |
| 22 | **Ambient Desk** (Web Audio page-rustle / stamp-thunk / pen-scratch + haptics) | 8 | 7 | 4 | 9 | 7 | **7.0** |
| 23 | **NFC Talismans** (tap a tagged object → pre-filled stamped entry) | 7 | 6 | 7 | 7 | 6 | **6.6** |
| 24 | **The Interrogation** (Shortcut voice round-trip: AI questions odd spending) | 7 | 6 | 6 | 8 | 6 | **6.6** |

---

## Reading the table

- **Top tier (8.0+)** — a big logjam at **8.2**, because dropping the feasibility penalty and rewarding
  Craft let the technically-audacious ideas (Loose Receipts, Passport, Wet Ink) climb to meet the
  coherent keystones (Closing the Books, Sparklines, Marginalia). The tie is real: above 8.0 it's a
  taste call, not a math call.
- **Two clusters share leverage at the top:**
  - **Generative-ink toolkit** (seeded `feTurbulence`, draw-on stroke animation, baked grain) underlies
    Closing the Books, Wet Ink, Sparklines, Aging Paper, Monthly Letter, Annual Statement. Build once → six get cheap.
  - **Shader/physics deepening** of the existing three.js scene: Wet Ink, Loupe, Paper Curl, Loose
    Receipts, Passport. All extend the page-turn rig you already shipped.
- **Lower tier (6.6–7.2)** — not worse ideas, just lower daily *Useful* (Fortune, Ambient, Blotter) or
  gated by owning hardware (Thermal, NFC, e-ink) / a print feedback loop (Year Bound, Mailable).

## Cross-cutting notes from the council

- **One engine, many features:** a deterministic generative-ink toolkit underlies #1, #2, #4, #5, #7,
  #11, #13. Highest-leverage thing to build first.
- **One shared risk:** `html-to-image` fidelity under heavy SVG filters / transforms / masks gates the
  capture-dependent ideas (#10, #18 collage, #22 nested book). Worth a spike before committing.
- **Physical-world ideas** score lower on feasibility only — not on soul. They're the "leak into atoms"
  endgame once the on-screen book is rich.

---

## Inbox — unscored, full spec TBD

### Daily reconciliation nudge + merchant-learning AI

**The nag (Phase 1):** 9pm Vercel cron → if 0 entries logged today, push a reminder to phone.
Push via **ntfy.sh** (free, random topic name as the only secret) or **Pushover** ($5, account-bound, private). No PWA/Web Push — over-engineered for one user.

**Teeth (Phase 2):** read today's bank-transaction emails via **Gmail API + a stored refresh token**
(single-user, one-time OAuth consent, scope `gmail.readonly`, reuse my existing bank-email filter).
Richer nudge: *"0 logged, but 3 bank emails today."*

**Brains (Phase 3):** gpt-5.4 parses bank emails → notification lists merchant + amount, or
pre-creates draft entries to confirm with one tap.

**Merchant learning** — the ambitious part:
- **Reframe:** this is a *lookup table*, not "AI memory." Data is structured (`account_number → label`).
- **Storage:** a Postgres table `merchant_map (account_number, nickname, label, category)`, **not** a
  markdown file — Vercel's FS is ephemeral/read-only at runtime; markdown would also bloat the prompt.
- **Reactive learning first** (I'm the teacher): in the existing chat page I say e.g. *"số tài khoản 0192923
  nickname ABCXYZ là quán bún bò"* → AI extracts `{account, nickname, label}` → upserts one row.
  AI is used only to *write* rows.
- **Applying is deterministic:** matching a bank email to a label is a plain DB join — no AI, no token cost,
  no re-guessing. System gets smarter by accumulating rows.
- **Proactive learning later:** once the table has enough rows, cluster recurring unknown accounts and
  *suggest* mappings to confirm in chat. Never auto-invent. Layer on top of the same table.

**Sequencing:** ship the bare nag first (most of the value), add Gmail when it feels dumb, add AI when
counting isn't enough. The one real cost is Gmail OAuth; everything else is cheap.

---

*Scores are one synthesizer's calibration of five council members' arguments — argue with them.*
