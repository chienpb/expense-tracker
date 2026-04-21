/**
 * Paper UI feature flag — Phase 5 rollout gate.
 *
 * Set `NEXT_PUBLIC_PAPER_UI=1` in the environment to render the migrated
 * Paper Ledger surfaces; anything else keeps the Swiss pages live. Each
 * migrated route reads `PAPER_UI_ENABLED` and picks its branch at render
 * time, so the flag can flip without redeploying (restart only — Next.js
 * inlines `NEXT_PUBLIC_*` at build).
 *
 * Side routes (`/login-paper`, `/dashboard-paper`, …) stay reachable
 * regardless of the flag so we can compare parity visually before the
 * flip. Middleware whitelists them alongside `/login`.
 *
 * When Phase 9 deletes Swiss, remove this module and the side routes.
 */
export const PAPER_UI_ENABLED = process.env.NEXT_PUBLIC_PAPER_UI === '1';
