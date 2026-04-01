import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function authorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('dashboard_session')?.value;
  return cookie === process.env.DASHBOARD_PASSWORD;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  subcategory: string | null;
  frequency: string;
  next_due: string;
  active: boolean;
  created_at: string;
}

// GET — list all recurring expenses
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .order('active', { ascending: false })
    .order('next_due', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// POST — create a new recurring expense
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { amount, description, category, subcategory, frequency, next_due } = body;

  if (!amount || !description || !category || !frequency || !next_due) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({ amount, description, category, subcategory: subcategory || null, frequency, next_due })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}

// PATCH — update a recurring expense (toggle active, edit fields)
export async function PATCH(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('recurring_expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// DELETE — remove a recurring expense
export async function DELETE(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return Response.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
