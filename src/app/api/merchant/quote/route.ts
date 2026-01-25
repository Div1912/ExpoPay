import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { getExchangeRate } from '@/lib/fx-service';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { inr_amount, expiry_seconds = 45 } = await request.json();

  if (!inr_amount || inr_amount <= 0) {
    return NextResponse.json({ error: 'Valid INR amount required' }, { status: 400 });
  }

  try {
    const rate = await getExchangeRate('INR', 'XLM');
    const xlm_amount = inr_amount * rate;
    const expiresAt = new Date(Date.now() + expiry_seconds * 1000);

    const { data, error } = await supabaseAdmin
      .from('quote_locks')
      .insert({
        user_id: user.id,
        inr_amount,
        xlm_amount,
        rate,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Quote lock creation error:', error);
      return NextResponse.json({ error: 'Failed to lock quote' }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      inr_amount: data.inr_amount,
      xlm_amount: parseFloat(data.xlm_amount).toFixed(4),
      rate: parseFloat(data.rate).toFixed(6),
      expires_at: data.expires_at,
      seconds_remaining: expiry_seconds,
    });
  } catch (error) {
    console.error('Quote lock error:', error);
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get('id');

  if (!quoteId) {
    return NextResponse.json({ error: 'Quote ID required' }, { status: 400 });
  }

  const { data: quote, error } = await supabaseAdmin
    .from('quote_locks')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', user.id)
    .single();

  if (error || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  const now = new Date();
  const expiresAt = new Date(quote.expires_at);
  const secondsRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

  return NextResponse.json({
    ...quote,
    xlm_amount: parseFloat(quote.xlm_amount).toFixed(4),
    rate: parseFloat(quote.rate).toFixed(6),
    seconds_remaining: secondsRemaining,
    expired: secondsRemaining === 0 || quote.used,
  });
}
