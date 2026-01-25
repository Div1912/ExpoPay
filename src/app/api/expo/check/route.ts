import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  // Basic validation
  if (username.length < 3 || username.length > 20) {
    return NextResponse.json({ available: false, error: 'Username must be 3-20 characters' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, error: 'Only letters, numbers, and underscores allowed' });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('universal_id')
    .eq('universal_id', username)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ available: !data });
}
