import { auth } from '@/lib/auth-config';
import { getSupabase } from '@/lib/supabase';
import { computeMonthBundle, generateVerdict } from '@/lib/dashboard/wrapped';
import { format as formatDate } from 'date-fns';

/**
 * `POST /api/seal` — upsert a seal for `(session user, month)`. Sealing
 * the same month again (re-settle after a stale/reopened state) is the
 * same upsert with a fresh `sealed_at`.
 *
 * Auth is the session cookie via `middleware.ts`; we only READ the
 * user id here (not a re-check) — `sealed_months` is keyed per user.
 * This route writes the seal; it never gates expense writes (spec AC#9).
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const month = String(body?.month ?? '').trim();
  if (!/^\d{4}-\d{2}-01$/.test(month)) {
    return Response.json(
      { error: 'month must be a first-of-month date (YYYY-MM-01)' },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  // Monthly Wrapped (spec: work/monthly-wrapped). Compute the deterministic
  // bundle, then generate the verdict ONCE at seal time and store it. A
  // re-seal overwrites the prior verdict (DECISION_LOG 2026-06-23). The
  // numbers are recomputed on every read, so only the prose is persisted.
  const bundle = await computeMonthBundle(month);
  const label = formatDate(new Date(`${month}T00:00:00`), 'MMMM yyyy');
  // The aggregates are never gated on the AI (spec AC#7): on failure we store
  // null and the slip still stands on the bundle alone.
  const wrappedText = await generateVerdict(bundle, label).catch(() => null);

  const { data, error } = await supabase
    .from('sealed_months')
    .upsert(
      {
        user_id: userId,
        month,
        sealed_at: new Date().toISOString(),
        wrapped_text: wrappedText,
      },
      { onConflict: 'user_id,month' },
    )
    .select('month, sealed_at, wrapped_text')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  // The live-seal reveal consumes `bundle` + `wrapped_text` directly.
  return Response.json({ ...data, bundle }, { status: 200 });
}
