import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { current_pin, new_pin } = await request.json();

  if (!new_pin || new_pin.length !== 4 || !/^\d{4}$/.test(new_pin)) {
    return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('app_pin')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile.app_pin && profile.app_pin !== current_pin) {
    return NextResponse.json({ error: 'Current PIN is incorrect' }, { status: 401 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ app_pin: new_pin })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update PIN' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'PIN updated successfully' });
}
