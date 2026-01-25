import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contract_id } = await request.json();

  if (!contract_id) {
    return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
  }

  const { data: contract } = await supabaseAdmin
    .from('contracts')
    .select('*')
    .eq('id', contract_id)
    .single();

  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  }

  if (contract.payer_id !== user.id) {
    return NextResponse.json({ error: 'Only payer can access this contract' }, { status: 403 });
  }

  if (contract.status === 'funded' || contract.status === 'delivered') {
    return NextResponse.json({
      success: true,
      message: 'Contract is already funded. Funds are in escrow.',
      contract
    });
  }

  return NextResponse.json({ 
    error: `Contract status is ${contract.status}. Cannot fund.` 
  }, { status: 400 });
}
