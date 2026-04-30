import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendGaslessPayment, canSponsorFees } from '@/lib/fee-bump';
import { getExchangeRate } from '@/lib/fx-service';
import { notifyPayment } from '@/lib/notify';
import { logInfo, logError, logWarn } from '@/lib/logger';

const ROUTE = '/api/payments/gasless';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { recipient, amount, note, pin, purpose, currency } = await request.json();
  if (!recipient || !amount) {
    return NextResponse.json({ error: 'Recipient and amount are required' }, { status: 400 });
  }

  // Check platform can sponsor fees
  const canSponsor = await canSponsorFees();
  if (!canSponsor) {
    return NextResponse.json(
      { error: 'Gasless sponsorship temporarily unavailable. Please use standard send.' },
      { status: 503 }
    );
  }

  const { data: senderProfile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!senderProfile?.stellar_secret) {
    return NextResponse.json({ error: 'Sender Stellar account not found' }, { status: 404 });
  }

  // PIN verification
  if (senderProfile.app_pin) {
    if (!pin) {
      return NextResponse.json({ error: 'PIN is required to authorize payment' }, { status: 400 });
    }
    if (senderProfile.app_pin !== pin) {
      await logWarn('gasless_payment_invalid_pin', { route: ROUTE, user_id: user.id });
      return NextResponse.json({ error: 'Invalid PIN. Please try again.' }, { status: 401 });
    }
  }

  try {
    let recipientAddress = recipient;
    let recipientProfile: any = null;

    if (recipient.includes('@expo') || !recipient.startsWith('G')) {
      const username = recipient.replace('@expo', '');
      const { data: recProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('universal_id', username)
        .single();

      if (!recProfile) {
        return NextResponse.json({ error: 'Recipient Universal ID not found' }, { status: 404 });
      }
      recipientAddress = recProfile.stellar_address;
      recipientProfile = recProfile;
    }

    if (recipientProfile?.id === senderProfile.id) {
      return NextResponse.json({ error: 'You cannot send money to yourself' }, { status: 400 });
    }

    const sourceCurrency = currency || senderProfile.preferred_currency || 'XLM';
    const xlmRate = await getExchangeRate(sourceCurrency, 'XLM');
    const xlmAmount = (parseFloat(amount) * xlmRate).toFixed(7);

    const senderName = senderProfile.universal_id || 'unknown';
    const recipientName = recipientProfile?.universal_id || recipient.replace('@expo', '');
    let memo = purpose || note || '';
    memo = `${memo}|${senderName}>${recipientName}`.substring(0, 28);

    // Submit as fee-bump (gasless) transaction
    const result = await sendGaslessPayment({
      fromSecret: senderProfile.stellar_secret,
      toAddress: recipientAddress,
      amount: xlmAmount,
      memo,
    });

    // Record in database with gasless flag
    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        sender_id: senderProfile.id,
        recipient_id: recipientProfile?.id || null,
        sender_universal_id: senderProfile.universal_id,
        recipient_universal_id: recipientProfile?.universal_id || recipient,
        amount: parseFloat(amount),
        currency: sourceCurrency,
        tx_hash: result.txHash,
        status: 'completed',
        note: `XLM:${xlmAmount}`,
        purpose: purpose || null,
        gasless: true,
        fee_sponsor: result.feePaidBy,
      });

    if (txError) console.error('History recording error:', txError);

    await logInfo('gasless_payment_success', {
      route: ROUTE,
      user_id: user.id,
      meta: {
        amount,
        currency: sourceCurrency,
        xlm_amount: xlmAmount,
        tx_hash: result.txHash,
        recipient: recipientName,
      },
    });

    // Fire-and-forget notifications
    if (recipientProfile?.id) {
      notifyPayment({
        senderId: senderProfile.id,
        recipientId: recipientProfile.id,
        senderUniversalId: senderProfile.universal_id || '',
        recipientUniversalId: recipientProfile.universal_id || '',
        amount: parseFloat(amount),
        currency: sourceCurrency,
        txHash: result.txHash,
        note: note || purpose || undefined,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      gasless: true,
      tx_hash: result.txHash,
      fee_paid_by: result.feePaidBy,
      amount_sent: parseFloat(amount),
      currency: sourceCurrency,
      xlm_amount: parseFloat(xlmAmount),
      message: 'Transaction fee sponsored by ExpoPay ⚡',
    });
  } catch (error: any) {
    await logError('gasless_payment_failed', error, { route: ROUTE, user_id: user.id });
    return NextResponse.json({ error: error.message || 'Gasless payment failed' }, { status: 500 });
  }
}
