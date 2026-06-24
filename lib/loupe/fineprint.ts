import type { Expense } from '@/lib/dashboard/queries';

/**
 * The hidden provenance layer (the-loupe spec §"two-layer reveal").
 *
 * Draws, for each visible `[data-row-id]` row, five lines of clerical
 * fine-print onto a viewport-sized canvas — text that exists *only* on
 * this GPU texture, never in the DOM. The lens shader composites it at
 * the magnified UV, so it shows only inside the glass.
 *
 * Drawn directly with Canvas 2D rather than `html-to-image` (DECISION_LOG
 * 2026-06-24): crisper micro-type, no `var()`/foreignObject hazard, less
 * code. The canvas backs at `dpr`× so the magnified print stays legible.
 *
 * PRINTED layer per design-system §0.2 — system metadata is never
 * handwritten, so this is typewriter `ink`, not the keeper's hand. The
 * `audit_note` text keeps the keeper's voice but is still machine-printed
 * fine-print here.
 */

// Compact metrics: five lines ride within a 32px ruled row so adjacent
// rows' fine-print doesn't collide under the glass. Magnified ~2× by the
// lens and backed at 3×, 6px print reads at ~12px crisp.
const FONT_PX = 6;
const LINE_PX = 6.4;
const INDENT_PX = 6;

const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

/** The five provenance lines for one entry. Missing fields → `—`. */
function provenanceLines(e: Expense): string[] {
  const time = TIME_FORMATTER.format(new Date(e.created_at));
  const verdict = e.audit_verdict ?? '—';
  const note = e.audit_note?.trim();
  return [
    `logged ${time}`,
    `id ${e.id}`,
    `subcat ${e.subcategory?.trim() || '—'}`,
    `type ${e.type}`,
    note ? `verdict ${verdict} · ${note}` : `verdict ${verdict}`,
  ];
}

/**
 * Build the provenance texture canvas. Reads each row's live rect so the
 * fine-print lands exactly over its row; captured in the same frame as
 * the base page so the two layers align.
 */
export function buildFinePrint(
  root: HTMLElement,
  byId: Map<string, Expense>,
  dpr = 3,
): HTMLCanvasElement {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const docStyle = getComputedStyle(document.documentElement);
  const ink = docStyle.getPropertyValue('--color-ink').trim() || '#2c2418';
  const paper = docStyle.getPropertyValue('--color-paper-2').trim() || '#efe6d3';
  const family =
    docStyle.getPropertyValue('--font-typewriter').trim() ||
    '"Courier New", monospace';

  ctx.textBaseline = 'top';
  ctx.font = `${FONT_PX}px ${family}`;

  // Mask the (unmasked) table header strip with blank paper. The lens'
  // spherical bulge samples neighbouring texture toward the cursor, so the
  // header's raw "DATE / DESCRIPTION / …" text would otherwise bleed over
  // the first row's fine-print under the glass. Data rows already self-mask,
  // so the header is the only strip that needs covering.
  for (const head of root.querySelectorAll<HTMLElement>('thead tr')) {
    const rect = head.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    ctx.fillStyle = paper;
    ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
  }

  for (const el of root.querySelectorAll<HTMLElement>('[data-row-id]')) {
    const id = el.dataset.rowId;
    if (!id) continue;
    const expense = byId.get(id);
    if (!expense) continue;

    const rect = el.getBoundingClientRect();
    // Hidden rows (the mobile receipt-card stack on desktop) collapse to
    // a zero box — skip them so only the visible table rows get print.
    if (rect.width === 0 || rect.height === 0) continue;

    // Opaque paper panel so the magnified base text behind the row doesn't
    // bleed through and muddy the fine-print under the glass.
    ctx.fillStyle = paper;
    ctx.fillRect(rect.left, rect.top, rect.width, rect.height);

    ctx.fillStyle = ink;
    const x = rect.left + INDENT_PX;
    let y = rect.top + 1;
    for (const line of provenanceLines(expense)) {
      ctx.fillText(line, x, y);
      y += LINE_PX;
    }
  }

  return canvas;
}
