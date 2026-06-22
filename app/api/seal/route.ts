import { auth } from '@/lib/auth-config';
import { getSupabase } from '@/lib/supabase';

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
  const { data, error } = await supabase
    .from('sealed_months')
    .upsert(
      { user_id: userId, month, sealed_at: new Date().toISOString() },
      { onConflict: 'user_id,month' },
    )
    .select('month, sealed_at')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  // Returns the sealed month so a future Monthly Wrapped can consume it.
  return Response.json(data, { status: 200 });
}
