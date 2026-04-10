import { getSupabase } from '@/lib/supabase';

type ExpenseType = 'expense' | 'income';

function parsePayload(body: unknown):
  | {
      amount: number;
      description: string;
      category: string;
      subcategory: string | null;
      type: ExpenseType;
      date: string;
    }
  | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request body' };
  }

  const record = body as Record<string, unknown>;
  const amount =
    typeof record.amount === 'number'
      ? record.amount
      : Number.parseInt(String(record.amount ?? ''), 10);
  const description = String(record.description ?? '').trim();
  const category = String(record.category ?? '').trim();
  const subcategoryRaw = String(record.subcategory ?? '').trim();
  const type = record.type === 'income' ? 'income' : 'expense';
  const date = String(record.date ?? '').trim();

  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number' };
  }

  if (!description || !category || !date) {
    return { error: 'Missing required fields' };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Date must be in YYYY-MM-DD format' };
  }

  return {
    amount,
    description,
    category,
    subcategory: subcategoryRaw || null,
    type,
    date,
  };
}

export async function POST(request: Request) {
  const parsed = parsePayload(await request.json());
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .insert(parsed)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String((body as { id?: unknown })?.id ?? '').trim();
  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400 });
  }

  const parsed = parsePayload(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('expenses')
    .update(parsed)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id || typeof id !== 'string') {
    return Response.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
