import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { getBalances } from '@/lib/stellar';
import { convertAmount } from '@/lib/fx-service';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stellar_address, preferred_currency')
    .eq('id', user.id)
    .single();

  if (!profile?.stellar_address) {
    return NextResponse.json({ error: 'Stellar address not found' }, { status: 404 });
  }

  const balances = await getBalances(profile.stellar_address);
  const preferredCurrency = profile.preferred_currency || 'XLM';
  
  const xlmBalance = balances.find(b => b.asset === 'XLM')?.balance || '0';
  const convertedBalance = await convertAmount(parseFloat(xlmBalance), 'XLM', preferredCurrency);
  
  const enrichedBalances = [
    ...balances,
    {
      asset: preferredCurrency,
      balance: convertedBalance.toFixed(2),
      converted: true,
      from_xlm: xlmBalance
    }
  ];
  
  return NextResponse.json({ 
    balances: enrichedBalances,
    xlm_balance: xlmBalance,
    preferred_currency: preferredCurrency,
    converted_balance: convertedBalance.toFixed(2)
  });
}
