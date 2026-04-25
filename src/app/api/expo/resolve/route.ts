import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('stellar_address, universal_id, full_name, display_name, preferred_currency, phone_number, avatar_url')
    .eq('universal_id', username)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Universal ID not found' }, { status: 404 });
  }

  return NextResponse.json({
    username: data.universal_id,
    address: data.stellar_address,
    display_name: data.display_name || data.full_name || data.universal_id,
    full_name: data.full_name,
    avatar_url: data.avatar_url || null,
    preferred_currency: data.preferred_currency || 'USDC',
    verified: !!data.phone_number,
  });
}
