import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { notifySplit, notifySplitCreatedSummary } from '@/lib/notify';

// GET /api/split — list splits where user is creator or participant
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: asSplitter } = await supabaseAdmin
    .from('split_bills')
    .select('*, split_participants(*)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  const { data: asParticipant } = await supabaseAdmin
    .from('split_participants')
    .select('split_id')
    .eq('user_id', user.id);

  const participantSplitIds = (asParticipant || []).map((p: any) => p.split_id);

  let participantSplits: any[] = [];
  if (participantSplitIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('split_bills')
      .select('*, split_participants(*)')
      .in('id', participantSplitIds)
      .neq('creator_id', user.id)
      .order('created_at', { ascending: false });
    participantSplits = data || [];
  }

  const allSplits = [...(asSplitter || []), ...participantSplits]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(allSplits);
}

// POST /api/split — create a new split
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, note, total_amount, currency = 'XLM', participants } = await request.json();
  // participants: [{ universal_id: string, amount_owed: number }]

  if (!title || !total_amount || !participants?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: creatorProfile } = await supabaseAdmin
    .from('profiles')
    .select('universal_id, stellar_address')
    .eq('id', user.id)
    .single();

  if (!creatorProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Resolve all participant profiles
  const universalIds = participants.map((p: any) => p.universal_id.replace('@expo', '').trim());
  const { data: participantProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, universal_id, stellar_address')
    .in('universal_id', universalIds);

  if (!participantProfiles || participantProfiles.length !== universalIds.length) {
    const found = (participantProfiles || []).map((p: any) => p.universal_id);
    const missing = universalIds.filter((id: string) => !found.includes(id));
    return NextResponse.json({ error: `Users not found: ${missing.join(', ')}` }, { status: 404 });
  }

  // Check no one added themselves
  if (participantProfiles.some((p: any) => p.id === user.id)) {
    return NextResponse.json({ error: 'Cannot add yourself as a participant' }, { status: 400 });
  }

  // Create the split bill
  const { data: split, error: splitError } = await supabaseAdmin
    .from('split_bills')
    .insert({
      creator_id: user.id,
      creator_universal_id: creatorProfile.universal_id,
      title,
      note: note || null,
      total_amount: parseFloat(total_amount),
      currency,
      status: 'active',
    })
    .select()
    .single();

  if (splitError || !split) {
    return NextResponse.json({ error: 'Failed to create split' }, { status: 500 });
  }

  // Insert participants
  const participantRows = participants.map((p: any) => {
    const profile = participantProfiles.find(
      (pr: any) => pr.universal_id === p.universal_id.replace('@expo', '').trim()
    );
    return {
      split_id: split.id,
      user_id: profile!.id,
      universal_id: profile!.universal_id,
      stellar_address: profile!.stellar_address,
      amount_owed: parseFloat(p.amount_owed),
      status: 'pending',
    };
  });

  const { error: participantError } = await supabaseAdmin
    .from('split_participants')
    .insert(participantRows);

  if (participantError) {
    // Rollback: delete the split
    await supabaseAdmin.from('split_bills').delete().eq('id', split.id);
    return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
  }

  // Send in-app notifications AND email alerts to all participants
  for (const profile of participantProfiles) {
    const amountOwed = participants.find(
      (p: any) => p.universal_id.replace('@expo', '').trim() === profile.universal_id
    )?.amount_owed;

    // Insert in-app notification via Supabase (real-time channel)
    Promise.resolve(supabaseAdmin.from('notifications').insert({
      user_id: profile.id,
      type: 'split_request',
      title: `Split Request: ${title}`,
      message: `${creatorProfile.universal_id}@expo added you to a split. You owe ${amountOwed} ${currency}.`,
      data: { split_id: split.id },
      read: false,
    })).catch(() => {}); // non-blocking

    // Fire-and-forget email alert
    notifySplit({
      splitId: split.id,
      splitTitle: title,
      amount: parseFloat(amountOwed),
      currency,
      creatorId: user.id,
      creatorUniversalId: creatorProfile.universal_id,
      participantId: profile.id,
      participantUniversalId: profile.universal_id,
      totalAmount: parseFloat(total_amount),
      totalParticipants: participantProfiles.length,
    }).catch(console.error);
  }

  // Also notify the creator with a summary
  notifySplitCreatedSummary({
    splitId: split.id,
    splitTitle: title,
    totalAmount: parseFloat(total_amount),
    currency,
    creatorId: user.id,
    participantCount: participantProfiles.length,
  }).catch(console.error);

  return NextResponse.json({ success: true, split });
}
