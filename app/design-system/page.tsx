import { PhaseThree } from './_phase-three';
import { PhaseTwo } from './_phase-two';

/**
 * `/design-system` — the Paper Ledger visual-regression deck.
 *
 * Every primitive ships here the moment it lands. Phases compose
 * top-to-bottom; each phase module owns its section so phase work
 * never has to touch the page shell. Development-only — the layout
 * above calls `notFound()` in production.
 */
export default function DesignSystemIndex() {
  return (
    <div className="mx-auto max-w-5xl font-serif text-ink">
      <header>
        <h1 className="font-serif text-title-1 font-bold text-ink">
          Paper Ledger — Design System
        </h1>
        <p className="mt-2 max-w-prose text-body-l leading-relaxed text-ink-mute">
          Every primitive below renders on both Day and Midnight themes so
          regressions catch at the foundation layer. Components land the
          moment they ship; states (hover / focus / disabled / empty / error)
          accumulate as each phase completes.
        </p>
      </header>

      <PhaseTwo />
      <PhaseThree />
    </div>
  );
}
