import type { Metadata } from 'next';
import { CompassRose } from '@/app/trips/_components/carto/CompassRose';
import { HandPath } from '@/app/trips/_components/carto/HandPath';
import { WaxSeal } from '@/app/trips/_components/carto/WaxSeal';
import { Cartouche } from '@/app/trips/_components/carto/Cartouche';
import { TerrainGlyph } from '@/app/trips/_components/carto/TerrainGlyph';
import { Foxing } from '@/app/trips/_components/carto/Foxing';
import { Sea } from '@/app/trips/_components/carto/Sea';
import { Island } from '@/app/trips/_components/carto/Island';
import type { Pt } from '@/lib/trips-carto';
import { normalize } from '@/lib/trips-carto';

export const metadata: Metadata = { title: 'Trips — design system preview' };

/* A fake hand-walked route (raw lon/lat-ish points → normalized 0–1). */
const RAW_ROUTE: Pt[] = [
  { x: 12, y: 80 }, { x: 18, y: 64 }, { x: 30, y: 60 }, { x: 36, y: 44 },
  { x: 48, y: 40 }, { x: 52, y: 26 }, { x: 66, y: 24 }, { x: 74, y: 12 },
];
const ROUTE = normalize(RAW_ROUTE);

const TOKENS: [string, string][] = [
  ['--trips-sea', 'Atlas ground wash'],
  ['--trips-sea-deep', 'deep sea / fog'],
  ['--trips-land', 'parchment base'],
  ['--trips-land-hi', 'coastal rim'],
  ['--trips-land-lo', 'land interior'],
  ['--trips-ink', 'coastline / labels'],
  ['--trips-route', 'the route'],
  ['--trips-stipple', 'coastal feathering'],
  ['--trips-rhumb', 'rhumb lines'],
  ['--trips-fox', 'foxing'],
  ['--trips-frame', 'borders'],
  ['--trips-red', 'you-are-here / today'],
  ['--trips-gold', 'wax (gold)'],
  ['--trips-wax-red', 'wax (red)'],
];

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <h2 className="font-serif text-[26px] font-bold text-[var(--trips-ink)]">
        <span className="mr-2 font-typewriter text-[13px] text-[var(--trips-frame)]">{n}</span>
        {title}
      </h2>
      {note && (
        <p className="mb-4 mt-1 max-w-[65ch] font-serif text-[15px] italic text-[var(--trips-frame)]">
          {note}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function TripsPreviewPage() {
  return (
    <main className="min-h-full bg-[#d8c096] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 border-b-2 border-[var(--trips-frame)] pb-4">
          <h1 className="font-hand-signature text-[clamp(36px,6vw,56px)] leading-none text-[var(--trips-ink)]">
            Cartographer’s Hand
          </h1>
          <p className="mt-2 font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)]">
            Trips design system · live preview · docs/trips-design-system.md
          </p>
        </header>

        <Section n="§2" title="Palette" note="Ink + sea carry the identity; parchment recedes. Red is rationed to ‘you are here / today’.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TOKENS.map(([token, use]) => (
              <div key={token} className="border border-[var(--trips-frame)]">
                <div className="h-16" style={{ backgroundColor: `var(${token})` }} />
                <div className="px-2 py-1">
                  <div className="font-typewriter text-[10px] text-[var(--trips-ink)]">{token}</div>
                  <div className="font-serif text-[12px] italic text-[var(--trips-frame)]">{use}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section n="§3·LOUD" title="The Atlas (sea-dominant)" note="Wobble-bordered parchment islands on an uneven iron-gall wash with faint rhumb lines. Markers are wax seals; click sails into the trip.">
          <Sea className="h-[420px] w-full border-2 border-[var(--trips-frame)]">
            <Island id="atlas-a" size={300} className="absolute left-[6%] top-[12%]">
              <div className="absolute left-[42%] top-[40%]">
                <WaxSeal id="trip-1" label="Hà Giang loop" color="red" glyph="HG" />
              </div>
              <div className="absolute left-[60%] top-[62%]">
                <WaxSeal id="trip-2" label="Sơn Trà ride (visited)" color="gold" state="broken" glyph="ST" />
              </div>
            </Island>
            <Island
              id="atlas-b"
              size={180}
              d="M 28 50 C 24 34 44 24 60 30 C 78 30 84 50 74 64 C 62 80 36 76 30 62 C 26 58 28 54 28 50 Z"
              className="absolute right-[8%] bottom-[10%]"
            >
              <div className="absolute left-[46%] top-[44%]">
                <WaxSeal id="trip-3" label="A private page" state="ghost" />
              </div>
            </Island>
            <div className="absolute right-3 top-3">
              <CompassRose size={84} />
            </div>
          </Sea>
        </Section>

        <Section n="§3·LOUD" title="Trip-map cover" note="A parchment sheet: one cartouche, one compass rose, the inked route, terrain glyphs, and a ‘you are here’ red mark. Asymmetric foxing — never a vignette.">
          <div className="relative h-[420px] w-full overflow-hidden border-2 border-[var(--trips-frame)] bg-[var(--trips-land)]">
            <Foxing seed="cover-demo" intensity={0.55} />
            {/* terrain */}
            <div className="absolute left-[14%] top-[26%]"><TerrainGlyph kind="mountain" size={40} /></div>
            <div className="absolute left-[22%] top-[40%]"><TerrainGlyph kind="mountain" size={30} /></div>
            <div className="absolute left-[58%] top-[30%]"><TerrainGlyph kind="tree" size={32} /></div>
            <div className="absolute left-[70%] top-[64%]"><TerrainGlyph kind="wave" size={36} /></div>
            {/* the route */}
            <HandPath
              points={ROUTE}
              variant="route"
              width={520}
              height={300}
              label="The recorded route"
              className="absolute left-[12%] top-[18%]"
            />
            {/* you-are-here (the one red mark) */}
            <div className="absolute left-[64%] top-[16%] h-3 w-3 rounded-full border-2 border-[var(--trips-red)] bg-[var(--trips-red)]" aria-label="you are here" role="img" />
            {/* scene-opener seals along the route */}
            <div className="absolute left-[27%] top-[52%]"><WaxSeal id="scene-1" label="Scene 1" color="gold" glyph="1" size={36} /></div>
            <div className="absolute left-[48%] top-[34%]"><WaxSeal id="scene-2" label="Scene 2" color="gold" glyph="2" size={36} /></div>
            <div className="absolute left-[6%] bottom-[6%]">
              <Cartouche title="Đèo Mã Pí Lèng" sub="14 — 17 Apr 2026 · 4 scenes" />
            </div>
          </div>
        </Section>

        <Section n="§3·QUIET" title="The scene viewer (church)" note="Whimsy switches OFF. The photo is the only full-contrast element; ≤1 ambient ornament; caption in Patrick Hand beneath, tilted like a taped-in album photo.">
          <div className="relative mx-auto max-w-xl bg-[var(--trips-land)] p-6">
            <Foxing seed="scene-quiet" intensity={0.25} />
            <div
              className="relative mx-auto aspect-[4/3] w-full bg-[var(--trips-ink)]"
              style={{ transform: 'rotate(-1.2deg)' }}
            >
              <div className="flex h-full items-center justify-center font-typewriter text-[11px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-land-hi)]">
                the photograph
              </div>
            </div>
            <p
              className="relative mt-4 text-center font-hand text-[20px] text-[var(--trips-ink)]"
              style={{ transform: 'rotate(-0.6deg)' }}
            >
              Sương mù cuốn qua đỉnh đèo — dừng lại uống cà phê.
            </p>
            <p className="relative mt-2 text-center font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-m)] text-[var(--trips-frame)]">
              3 of 11 · recorded 24 Jun 2026
            </p>
          </div>
        </Section>

        <Section n="§5" title="Wax seals — the marker primitive" note="Matte, irregular, recesses darker than the rim. Sealed / broken (visited) / ghost (private). Seeded tilt → feels placed.">
          <div className="flex flex-wrap items-center gap-8">
            <Figure label="sealed (red)"><WaxSeal id="s-a" label="Sealed" color="red" glyph="HG" /></Figure>
            <Figure label="sealed (gold)"><WaxSeal id="s-b" label="Sealed gold" color="gold" glyph="✦" /></Figure>
            <Figure label="broken (visited)"><WaxSeal id="s-c" label="Visited" color="gold" state="broken" glyph="2" /></Figure>
            <Figure label="ghost (private)"><WaxSeal id="s-d" label="Private" state="ghost" /></Figure>
          </div>
        </Section>

        <Section n="§5" title="Terrain glyphs (starter set of 3)" note="Münster molehill convention. The library grows one glyph at a time — Phase 4.">
          <div className="flex flex-wrap items-center gap-8">
            <Figure label="mountain"><TerrainGlyph kind="mountain" size={48} /></Figure>
            <Figure label="tree"><TerrainGlyph kind="tree" size={48} /></Figure>
            <Figure label="wave"><TerrainGlyph kind="wave" size={48} /></Figure>
          </div>
        </Section>

        <Section n="§5" title="Compass rose & route stroke">
          <div className="flex flex-wrap items-end gap-10">
            <Figure label="16-point portolan rose"><CompassRose size={120} /></Figure>
            <Figure label="route — varied dashes, taper">
              <HandPath points={ROUTE} variant="route" width={200} height={130} />
            </Figure>
            <Figure label="ink — solid structural line">
              <HandPath points={ROUTE} variant="ink" width={200} height={130} />
            </Figure>
          </div>
        </Section>

        <Section n="§1" title="Banned (for reference)" note="If a surface drifts toward any of these, it is shipping slop.">
          <ul className="max-w-[65ch] list-disc space-y-1 pl-6 font-serif text-[15px] text-[var(--trips-ink)]">
            <li>Symmetric edge-burn / vignette / radial darkening toward the frame.</li>
            <li>A flat tan rectangle as a surface.</li>
            <li>Centered, symmetric, or 3D compass rose.</li>
            <li>Evenly-spaced round-dot route.</li>
            <li>Glossy gradient wax blobs.</li>
            <li>X-marks-the-spot, skull, parrot, chest, rope border, footprints, GPS teardrop pins.</li>
            <li>Drop shadows, emoji, per-trip costume themes.</li>
          </ul>
        </Section>
      </div>
    </main>
  );
}

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="flex min-h-[120px] items-center justify-center">{children}</div>
      <figcaption className="font-typewriter text-[10px] uppercase tracking-[var(--letter-spacing-label-s)] text-[var(--trips-frame)]">
        {label}
      </figcaption>
    </figure>
  );
}
