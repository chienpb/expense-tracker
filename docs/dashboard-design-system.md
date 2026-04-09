# Swiss/International Typographic Style

Design reference for the dashboard UI in this repo.

## Context

This expense tracker dashboard uses `Next.js`, `shadcn/ui`, and `Tailwind CSS`.

The design direction is Swiss/International Typographic Style:
- clarity
- grid discipline
- typographic hierarchy
- data-first UI

No decoration for decoration's sake.

## Core Principles

1. Type does the heavy lifting. Avoid icons, illustrations, or visual gimmicks unless they materially improve comprehension.
2. Follow a strict grid. Elements should align consistently.
3. Use one accent color only. The palette is monochrome plus a single accent for interactive or alert states.
4. Use negative space intentionally. Dense does not mean better.
5. Build hierarchy through scale. Use size contrast instead of shadows, gradients, or ornament.

## Color Palette

Use CSS variables via shadcn theming in `app/globals.css`.

```css
--background: 0 0% 98%;
--foreground: 0 0% 5%;
--card: 0 0% 100%;
--card-foreground: 0 0% 5%;
--muted: 0 0% 93%;
--muted-foreground: 0 0% 45%;
--accent: 0 72% 51%;
--accent-foreground: 0 0% 100%;
--border: 0 0% 88%;
--ring: 0 0% 5%;
--destructive: 0 72% 51%;
```

Dark mode:

```css
--background: 0 0% 4%;
--foreground: 0 0% 95%;
--card: 0 0% 7%;
--muted: 0 0% 15%;
--muted-foreground: 0 0% 55%;
--accent: 0 72% 51%;
```

Rules:
- Never use more than one saturated color.
- Red is for emphasis, warnings, and key interactive elements only.
- Everything else should stay grayscale.
- Charts should use grayscale plus red only for the top category if emphasis is needed.

## Typography

Preferred font stack:
- `Geist Sans`
- `Helvetica Neue`
- `Inter`
- `sans-serif`

Type scale:

| Role | Size | Weight | Tracking | Usage |
| --- | --- | --- | --- | --- |
| Hero Stat | 4rem-6rem | 700 | -0.03em | Primary number |
| Section Stat | 2rem-3rem | 600 | -0.02em | Card-level numbers |
| Section Title | 0.75rem | 500 | 0.08em | Uppercase labels |
| Body | 0.875rem | 400 | 0em | Descriptions, details |
| Caption/Meta | 0.75rem | 400 | 0.02em | Secondary info |

Rules:
- Section titles are uppercase with wide tracking.
- Hero stats use tight tracking.
- Do not bold body text for emphasis. Prefer accent color or size contrast.
- All money and numeric displays use `tabular-nums`.

Tailwind guidance:

```ts
theme: {
  extend: {
    fontFamily: {
      sans: ['Geist Sans', 'Helvetica Neue', 'Inter', 'sans-serif'],
    },
    letterSpacing: {
      tighter: '-0.03em',
      tight: '-0.02em',
      wide: '0.08em',
    },
  },
}
```

## Layout And Grid

- Max width: `1200px`
- Grid: `12` columns
- Gutter: `1.5rem`
- Card padding: `2rem`
- Section vertical spacing: `3rem`

Rules:
- Cards use no radius or `rounded-sm` at most.
- Cards use a thin `1px` border and no shadow.
- Everything is left-aligned.
- Use hairline dividers instead of decorative spacing tricks.

## Component Patterns

### Card

```tsx
<Card className="rounded-sm border border-border shadow-none">
  <CardHeader className="pb-2">
    <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      Budget Remaining
    </CardTitle>
  </CardHeader>
  <CardContent>
    <span className="text-4xl font-bold tracking-tighter tabular-nums">
      $1,168.00
    </span>
  </CardContent>
</Card>
```

### Stat Pattern

Each stat should contain:
1. Uppercase label
2. Large number
3. Optional context line

Nothing else.

### Transaction List

```tsx
<div className="divide-y divide-border">
  {transactions.map((tx) => (
    <div key={tx.id} className="flex items-baseline justify-between py-3">
      <div>
        <p className="text-sm">{tx.description}</p>
        <p className="text-xs text-muted-foreground">
          {tx.category} · {tx.date}
        </p>
      </div>
      <span className="text-sm tabular-nums">
        -${tx.amount}
      </span>
    </div>
  ))}
</div>
```

### Charts

- Use gray bars by default.
- Use red only for the top category when emphasis is needed.
- No rounded corners.
- Very faint or no grid lines.
- Axis labels are small, uppercase, and muted.
- Avoid legends when direct labeling works.
- No chart animation.

## Interaction And Motion

- No layout transitions.
- Hover states should be subtle, like `hover:bg-muted/50`.
- Selected states should use underline, border, or muted fill.
- Focus rings use `ring-foreground`.

## Do Not Do

- No `rounded-xl` or `rounded-full` cards
- No colored category pills
- No emoji in UI
- No gradients
- No shadows on cards
- No decorative illustrations
- No icon-heavy navigation
- No icon-heavy toasts
- No shimmer skeletons
- No multi-color chart palettes

## Checklist

- All monetary values use `tabular-nums`
- Section labels are uppercase with wide tracking
- Big numbers use tight tracking and dominate their section
- Cards use `rounded-sm border shadow-none`
- Only one accent color appears outside grayscale
- Everything is left-aligned
- Decorative elements are removed unless they convey data
