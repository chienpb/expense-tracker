import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('expenses').select('id').limit(1);
    if (error) throw new Error(error.message);
    return Response.json({ status: 'ok', db: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ status: 'error', db: message }, { status: 503 });
  }
}
