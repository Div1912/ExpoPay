/**
 * notify.ts — Universal server-side notification utility for ExpoPay
 * Handles transactional emails via Resend for all platform events.
 * In-app toasts are handled client-side via PaymentNotification.tsx + contracts realtime.
 */

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const DOMAIN = 'https://exporouter.site';

// ─── Shared HTML shell ────────────────────────────────────────────────────────
function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ExpoPay</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111113;border:1px solid #27272a;border-radius:20px;overflow:hidden;">
        <!-- TOP GRADIENT BAR -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#C694F9,#F5A7C4,#94A1F9);"></td></tr>
        <!-- LOGO -->
        <tr><td style="padding:32px 40px 0;">
          <span style="font-size:22px;font-weight:900;letter-spacing:2px;color:#fff;">EXPO<span style="color:#C694F9;">PAY</span></span>
        </td></tr>
        <!-- CONTENT -->
        <tr><td style="padding:28px 40px 40px;">
          ${content}
        </td></tr>
        <!-- FOOTER -->
        <tr><td style="padding:24px 40px;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:11px;color:#52525b;line-height:1.6;">
            You are receiving this because you have an active ExpoPay account.<br/>
            © 2026 ExpoPay. All rights reserved. &nbsp;|&nbsp;
            <a href="${DOMAIN}" style="color:#71717a;text-decoration:none;">exporouter.site</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Reusable amount badge ────────────────────────────────────────────────────
function amountBadge(amount: number, currency: string, color = '#C694F9'): string {
  return `<div style="display:inline-block;background:#1c1c1f;border:1px solid #27272a;border-radius:12px;padding:12px 24px;margin:16px 0;">
    <span style="font-size:28px;font-weight:900;color:${color};">${amount.toFixed(2)} ${currency}</span>
  </div>`;
}

// ─── Reusable info row ────────────────────────────────────────────────────────
function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#71717a;font-size:13px;width:140px;">${label}</td>
    <td style="padding:8px 0;color:#e4e4e7;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;
}

// ─── Helper: fetch user email by userId ──────────────────────────────────────
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

// ─── Helper: fetch profile ───────────────────────────────────────────────────
async function getProfile(userId: string): Promise<{ full_name: string; universal_id: string } | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('full_name, universal_id')
    .eq('id', userId)
    .single();
  return data;
}

// ─── Send helper ─────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({ from: FROM, to: [to], subject, html });
  } catch (err) {
    console.error('[notify] Resend error:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/** Welcome email fired after onboarding completes */
export async function notifyWelcome(userId: string, username: string, fullName: string) {
  const email = await getUserEmail(userId);
  if (!email) return;

  const html = emailShell(`
    <h2 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#fff;">
      Welcome, ${fullName || username}! 🎉
    </h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 24px;">Your ExpoPay account is active and ready to use.</p>

    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Your Expo ID</p>
      <p style="margin:0;font-size:22px;font-weight:900;color:#C694F9;">@${username}</p>
    </div>

    <h3 style="color:#fff;font-size:15px;font-weight:700;margin:0 0 12px;">What you can do right now:</h3>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
      <tr><td style="padding:8px 0;border-bottom:1px solid #27272a;">
        <span style="color:#C694F9;font-weight:700;">🚀 Send & Receive</span>
        <span style="color:#71717a;font-size:13px;display:block;margin-top:2px;">Instant global payments to any @expo ID</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #27272a;">
        <span style="color:#C694F9;font-weight:700;">🔐 Escrow Contracts</span>
        <span style="color:#71717a;font-size:13px;display:block;margin-top:2px;">Create trustless smart contracts for freelance work</span>
      </td></tr>
      <tr><td style="padding:8px 0;">
        <span style="color:#C694F9;font-weight:700;">📊 Transaction History</span>
        <span style="color:#71717a;font-size:13px;display:block;margin-top:2px;">Full audit trail of every payment on the Stellar blockchain</span>
      </td></tr>
    </table>

    <a href="${DOMAIN}/dashboard" style="display:inline-block;background:#C694F9;color:#000;font-weight:900;font-size:15px;padding:14px 32px;border-radius:50px;text-decoration:none;">
      Open Dashboard →
    </a>
  `);

  await sendEmail(email, `Welcome to ExpoPay, ${fullName || username}! 🚀`, html);
}

/** P2P payment sent/received */
export async function notifyPayment(opts: {
  senderId: string;
  recipientId: string;
  senderUniversalId: string;
  recipientUniversalId: string;
  amount: number;
  currency: string;
  txHash: string;
  note?: string;
}) {
  const { senderId, recipientId, senderUniversalId, recipientUniversalId, amount, currency, txHash, note } = opts;
  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const [senderEmail, recipientEmail] = await Promise.all([
    getUserEmail(senderId),
    getUserEmail(recipientId),
  ]);

  const rows = `
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:20px 0;">
      ${infoRow('Date', ts + ' UTC')}
      ${infoRow('Reference', txHash.slice(0, 16) + '...')}
      ${note ? infoRow('Note', note) : ''}
    </table>`;

  // Email to sender
  if (senderEmail) {
    const html = emailShell(`
      <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Payment Sent</p>
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">You sent a payment</h2>
      ${amountBadge(amount, currency, '#F5A7C4')}
      <p style="color:#71717a;font-size:14px;margin:4px 0 0;">To <strong style="color:#e4e4e7;">@${recipientUniversalId}</strong></p>
      ${rows}
      <a href="${DOMAIN}/dashboard/history" style="display:inline-block;background:#18181b;color:#fff;font-size:13px;font-weight:600;padding:10px 24px;border-radius:50px;text-decoration:none;border:1px solid #27272a;">View Transaction</a>
    `);
    await sendEmail(senderEmail, `You sent ${amount.toFixed(2)} ${currency} on ExpoPay`, html);
  }

  // Email to recipient
  if (recipientEmail) {
    const html = emailShell(`
      <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Payment Received</p>
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">You received a payment!</h2>
      ${amountBadge(amount, currency, '#86efac')}
      <p style="color:#71717a;font-size:14px;margin:4px 0 0;">From <strong style="color:#e4e4e7;">@${senderUniversalId}</strong></p>
      ${rows}
      <a href="${DOMAIN}/dashboard" style="display:inline-block;background:#C694F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">View Dashboard</a>
    `);
    await sendEmail(recipientEmail, `You received ${amount.toFixed(2)} ${currency} on ExpoPay 💰`, html);
  }
}

/** Escrow event notifications */
export type EscrowEvent =
  | 'created'
  | 'funded'
  | 'delivered'
  | 'released'
  | 'disputed'
  | 'resolved_freelancer'
  | 'resolved_client'
  | 'refunded'
  | 'cancelled';

const ESCROW_EVENT_META: Record<EscrowEvent, { label: string; tagline: string; color: string; emoji: string }> = {
  created:             { label: 'Contract Created',            tagline: 'A new escrow contract has been created for you.',                   color: '#C694F9', emoji: '📋' },
  funded:              { label: 'Contract Funded',             tagline: 'Funds have been deposited into escrow and are locked on-chain.',    color: '#94A1F9', emoji: '💰' },
  delivered:           { label: 'Work Marked as Delivered',    tagline: 'The freelancer has marked the work as delivered. Please review.',   color: '#fb923c', emoji: '📦' },
  released:            { label: 'Funds Released',              tagline: 'The payer has approved the work and released funds to you.',        color: '#86efac', emoji: '✅' },
  disputed:            { label: 'Dispute Raised',              tagline: 'A dispute has been raised on this contract. An arbiter will review.',color: '#f87171', emoji: '⚠️' },
  resolved_freelancer: { label: 'Dispute Resolved — Paid',     tagline: 'The arbiter has resolved the dispute in favor of the freelancer.',  color: '#86efac', emoji: '⚖️' },
  resolved_client:     { label: 'Dispute Resolved — Refunded', tagline: 'The arbiter has resolved the dispute in favor of the client.',      color: '#94A1F9', emoji: '⚖️' },
  refunded:            { label: 'Contract Refunded',           tagline: 'Funds have been returned to the client.',                          color: '#94A1F9', emoji: '↩️' },
  cancelled:           { label: 'Contract Cancelled',          tagline: 'The contract has been cancelled.',                                  color: '#71717a', emoji: '🚫' },
};

export async function notifyEscrow(opts: {
  event: EscrowEvent;
  contractTitle: string;
  amount: number;
  currency: string;
  payerId: string;
  freelancerId: string;
  payerUniversalId: string;
  freelancerUniversalId: string;
  txHash?: string;
  notifyParties?: ('payer' | 'freelancer' | 'both');
}) {
  const {
    event, contractTitle, amount, currency,
    payerId, freelancerId, payerUniversalId, freelancerUniversalId,
    txHash, notifyParties = 'both',
  } = opts;

  const meta = ESCROW_EVENT_META[event];
  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const makeHtml = (recipientRole: 'payer' | 'freelancer') => {
    const counterparty = recipientRole === 'payer' ? freelancerUniversalId : payerUniversalId;
    const roleLabel = recipientRole === 'payer' ? 'Client' : 'Freelancer';

    return emailShell(`
      <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">${meta.emoji} Escrow Update</p>
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:${meta.color};">${meta.label}</h2>
      <p style="color:#71717a;font-size:14px;margin:0 0 20px;">${meta.tagline}</p>

      <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Contract</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#e4e4e7;">${contractTitle}</p>
      </div>

      ${amountBadge(amount, currency, meta.color)}

      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${infoRow('Your Role', roleLabel)}
        ${infoRow('Counterparty', '@' + counterparty)}
        ${infoRow('Date', ts + ' UTC')}
        ${txHash ? infoRow('Tx Hash', txHash.slice(0, 20) + '...') : ''}
      </table>

      <a href="${DOMAIN}/dashboard/contracts" style="display:inline-block;background:#C694F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
        View Contract →
      </a>
    `);
  };

  const subject = `${meta.emoji} ${meta.label} — ${contractTitle}`;

  const promises: Promise<void>[] = [];

  if (notifyParties === 'payer' || notifyParties === 'both') {
    promises.push(
      getUserEmail(payerId).then(e => e ? sendEmail(e, subject, makeHtml('payer')) : undefined)
    );
  }
  if (notifyParties === 'freelancer' || notifyParties === 'both') {
    promises.push(
      getUserEmail(freelancerId).then(e => e ? sendEmail(e, subject, makeHtml('freelancer')) : undefined)
    );
  }

  await Promise.allSettled(promises);
}

/** Security event (login, password change, PIN change) */
export async function notifySecurityEvent(userId: string, eventType: 'new_login' | 'password_changed' | 'pin_changed') {
  const email = await getUserEmail(userId);
  if (!email) return;

  const meta = {
    new_login:        { label: 'New Login Detected',    desc: 'A new sign-in was detected on your ExpoPay account.', emoji: '🔐', color: '#fb923c' },
    password_changed: { label: 'Password Changed',       desc: 'Your ExpoPay account password was successfully changed.', emoji: '🔑', color: '#C694F9' },
    pin_changed:      { label: 'PIN Updated',            desc: 'Your transaction PIN has been successfully changed.', emoji: '🔢', color: '#94A1F9' },
  }[eventType];

  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">${meta.emoji} Security Alert</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:${meta.color};">${meta.label}</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">${meta.desc}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Time', ts + ' UTC')}
    </table>
    <p style="color:#71717a;font-size:13px;margin:20px 0 0;">
      If this wasn't you, please 
      <a href="${DOMAIN}/auth/forgot-password" style="color:#C694F9;">reset your password immediately</a>.
    </p>
  `);

  await sendEmail(email, `${meta.emoji} ExpoPay Security: ${meta.label}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Email to a friend who was added to a split bill */
export async function notifySplit(opts: {
  splitId: string;
  splitTitle: string;
  amount: number;
  currency: string;
  creatorId: string;
  creatorUniversalId: string;
  participantId: string;
  participantUniversalId: string;
  totalAmount: number;
  totalParticipants: number;
}) {
  const {
    splitId, splitTitle, amount, currency,
    creatorUniversalId, participantId, totalAmount, totalParticipants,
  } = opts;

  const email = await getUserEmail(participantId);
  if (!email) return;

  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">🤝 Split Request</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#C694F9;">You've been added to a split!</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">
      <strong style="color:#e4e4e7;">@${creatorUniversalId}</strong> created a split bill and added you.
    </p>

    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Split For</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#e4e4e7;">${splitTitle}</p>
    </div>

    <div style="display:inline-block;background:#1c1c1f;border:1px solid #27272a;border-radius:12px;padding:12px 24px;margin:0 0 16px;">
      <p style="margin:0 0 2px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Your Share</p>
      <span style="font-size:28px;font-weight:900;color:#C694F9;">${amount.toFixed(2)} ${currency}</span>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Total Bill', `${totalAmount.toFixed(2)} ${currency}`)}
      ${infoRow('People', `${totalParticipants + 1} (including creator)`)}
      ${infoRow('Date', ts + ' UTC')}
    </table>

    <a href="${DOMAIN}/dashboard/split/${splitId}" style="display:inline-block;background:#C694F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
      Pay Your Share →
    </a>
  `);

  await sendEmail(email, `💸 You owe ${amount.toFixed(2)} ${currency} — ${splitTitle}`, html);
}

/** Email to the creator summarizing the split they created */
export async function notifySplitCreatedSummary(opts: {
  splitId: string;
  splitTitle: string;
  totalAmount: number;
  currency: string;
  creatorId: string;
  participantCount: number;
}) {
  const { splitId, splitTitle, totalAmount, currency, creatorId, participantCount } = opts;

  const email = await getUserEmail(creatorId);
  if (!email) return;

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">✅ Split Created</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">Your split is live!</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">Requests have been sent to all ${participantCount} friend(s).</p>

    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Split</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#e4e4e7;">${splitTitle}</p>
    </div>

    ${amountBadge(totalAmount, currency)}

    <a href="${DOMAIN}/dashboard/split/${splitId}" style="display:inline-block;background:#C694F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;margin-top:8px;">
      Track Payments →
    </a>
  `);

  await sendEmail(email, `✅ Split Created — ${splitTitle}`, html);
}

/** Email to creator when a participant pays their share */
export async function notifySplitPaid(opts: {
  splitId: string;
  splitTitle: string;
  amount: number;
  currency: string;
  payerUniversalId: string;
  creatorId: string;
  isComplete: boolean;
}) {
  const { splitId, splitTitle, amount, currency, payerUniversalId, creatorId, isComplete } = opts;

  const email = await getUserEmail(creatorId);
  if (!email) return;

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">💰 Payment Received</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#86efac;">@${payerUniversalId} paid their share!</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">for <strong style="color:#e4e4e7;">${splitTitle}</strong></p>

    ${amountBadge(amount, currency, '#86efac')}

    ${isComplete ? `
    <div style="background:#16a34a20;border:1px solid #16a34a50;border-radius:12px;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#86efac;">🎉 All done! Everyone has paid their share.</p>
    </div>` : ''}

    <a href="${DOMAIN}/dashboard/split/${splitId}" style="display:inline-block;background:#C694F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
      View Split →
    </a>
  `);

  await sendEmail(email, `💰 @${payerUniversalId} paid ${amount.toFixed(2)} ${currency} — ${splitTitle}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVINGS / POOL / STAKING NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Email when a user deposits into the XLM Yield Pool */
export async function notifyPoolDeposit(opts: {
  userId: string;
  amount: number;
  txHash: string;
  positionId: number;
}) {
  const { userId, amount, txHash, positionId } = opts;

  const email = await getUserEmail(userId);
  if (!email) return;

  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">🏦 Pool Deposit</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#94A1F9;">Your XLM is earning yield!</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">Your deposit into the EXPO Yield Pool has been confirmed on-chain. Rewards accrue daily.</p>

    ${amountBadge(amount, 'XLM', '#94A1F9')}

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Pool', 'EXPO XLM Yield Pool')}
      ${infoRow('Position ID', `#${positionId}`)}
      ${infoRow('Tx Hash', txHash.slice(0, 20) + '...')}
      ${infoRow('Date', ts + ' UTC')}
    </table>

    <a href="${DOMAIN}/dashboard/savings" style="display:inline-block;background:#94A1F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
      View Savings →
    </a>
  `);

  await sendEmail(email, `🏦 Pool Deposit Confirmed — ${amount.toFixed(2)} XLM`, html);
}

/** Email when a user stakes EXPO tokens */
export async function notifyStake(opts: {
  userId: string;
  amountExpo: number;
  durationDays: number;
  rewardExpo: number;
  txHash: string;
  stakeId: number;
  unlocksAt: Date;
}) {
  const { userId, amountExpo, durationDays, rewardExpo, txHash, stakeId, unlocksAt } = opts;

  const email = await getUserEmail(userId);
  if (!email) return;

  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
  const unlockStr = unlocksAt.toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">🔒 Staking Confirmed</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#C694F9;">Your EXPO is staked!</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">Your EXPO tokens are now locked and earning staking rewards.</p>

    ${amountBadge(amountExpo, 'EXPO', '#C694F9')}

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Duration', `${durationDays} days`)}
      ${infoRow('Expected Reward', `${rewardExpo.toFixed(4)} EXPO`)}
      ${infoRow('Unlocks On', unlockStr)}
      ${infoRow('Stake ID', `#${stakeId}`)}
      ${infoRow('Tx Hash', txHash.slice(0, 20) + '...')}
      ${infoRow('Staked At', ts + ' UTC')}
    </table>

    <a href="${DOMAIN}/dashboard/savings" style="display:inline-block;background:#C694F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
      View Staking →
    </a>
  `);

  await sendEmail(email, `🔒 EXPO Staking Confirmed — ${amountExpo.toFixed(2)} EXPO for ${durationDays} days`, html);
}

/** Email when a user unstakes and receives their principal + reward payout */
export async function notifyUnstake(opts: {
  userId: string;
  amountExpo: number;
  rewardExpo: number;
  payoutExpo: number;
  durationDays: number;
  txHash: string;
}) {
  const { userId, amountExpo, rewardExpo, payoutExpo, durationDays, txHash } = opts;

  const email = await getUserEmail(userId);
  if (!email) return;

  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">🔓 Unstake Complete</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#86efac;">Your EXPO has been unstaked!</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">Your staking position is complete and funds have been returned to your wallet.</p>

    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${infoRow('Principal Staked', `${amountExpo.toFixed(4)} EXPO`)}
        ${infoRow('Staking Reward', `+${rewardExpo.toFixed(4)} EXPO`)}
        ${infoRow('Duration', `${durationDays} days`)}
      </table>
    </div>

    <div style="display:inline-block;background:#1c1c1f;border:1px solid #27272a;border-radius:12px;padding:12px 24px;margin:0 0 20px;">
      <p style="margin:0 0 2px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Total Payout</p>
      <span style="font-size:28px;font-weight:900;color:#86efac;">${payoutExpo.toFixed(4)} EXPO</span>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Tx Hash', txHash.slice(0, 20) + '...')}
      ${infoRow('Date', ts + ' UTC')}
    </table>

    <a href="${DOMAIN}/dashboard/savings" style="display:inline-block;background:#86efac;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
      View Savings →
    </a>
  `);

  await sendEmail(email, `🔓 EXPO Unstaked — ${payoutExpo.toFixed(4)} EXPO returned to your wallet`, html);
}

/** Email for contract refund (payer gets money back) or freelancer auto-release/claim */
export async function notifyContractRefund(opts: {
  contractId: string;
  contractTitle: string;
  amount: number;
  currency: string;
  recipientId: string;
  recipientRole: 'payer' | 'freelancer';
  isAutoRelease: boolean;
  txHash: string;
}) {
  const { contractId, contractTitle, amount, currency, recipientId, recipientRole, isAutoRelease, txHash } = opts;

  const email = await getUserEmail(recipientId);
  if (!email) return;

  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const isPayer = recipientRole === 'payer';
  const color   = isPayer ? '#94A1F9' : '#86efac';
  const emoji   = isPayer ? '↩️' : (isAutoRelease ? '⏱️' : '⚖️');
  const heading = isPayer
    ? 'Refund Processed'
    : isAutoRelease ? 'Auto-Release: Funds Claimed' : 'Dispute Resolved — Funds Claimed';
  const tagline = isPayer
    ? 'Your refund has been processed and funds returned to your wallet.'
    : isAutoRelease
      ? 'The client didn\'t respond within 7 days. Funds have been automatically released to you.'
      : 'Your dispute was resolved in your favour. Funds have been released to your wallet.';

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">${emoji} Contract Update</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:${color};">${heading}</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">${tagline}</p>

    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">Contract</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:#e4e4e7;">${contractTitle}</p>
    </div>

    ${amountBadge(amount, currency, color)}

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Tx Hash', txHash.slice(0, 20) + '...')}
      ${infoRow('Date', ts + ' UTC')}
    </table>

    <a href="${DOMAIN}/dashboard/contracts" style="display:inline-block;background:${color};color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
      View Contract →
    </a>
  `);

  await sendEmail(email, `${emoji} ${heading} — ${contractTitle}`, html);
}

/** Email receipt for UPI merchant payment */
export async function notifyMerchantPayment(opts: {
  userId: string;
  merchantName: string;
  merchantUpiId: string;
  inrAmount: number;
  xlmAmount: number;
  exchangeRate: number;
  txHash: string;
  paymentId: string;
}) {
  const { userId, merchantName, merchantUpiId, inrAmount, xlmAmount, exchangeRate, txHash, paymentId } = opts;

  const email = await getUserEmail(userId);
  if (!email) return;

  const ts = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  const html = emailShell(`
    <p style="margin:0 0 4px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">🛒 Merchant Payment</p>
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">Payment Sent!</h2>
    <p style="color:#71717a;font-size:14px;margin:0 0 20px;">
      Your UPI merchant payment to <strong style="color:#e4e4e7;">${merchantName}</strong> was processed successfully.
    </p>

    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <div>
          <p style="margin:0 0 2px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">INR Amount</p>
          <p style="margin:0;font-size:24px;font-weight:900;color:#fff;">₹${inrAmount.toFixed(2)}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0 0 2px;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:.1em;">XLM Spent</p>
          <p style="margin:0;font-size:24px;font-weight:900;color:#C694F9;">${xlmAmount.toFixed(4)} XLM</p>
        </div>
      </div>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${infoRow('Merchant', merchantName)}
      ${infoRow('UPI ID', merchantUpiId)}
      ${infoRow('Exchange Rate', `1 XLM = ₹${exchangeRate.toFixed(2)}`)}
      ${infoRow('Payment ID', paymentId.slice(0, 16) + '...')}
      ${infoRow('Stellar Tx', txHash.slice(0, 20) + '...')}
      ${infoRow('Date', ts + ' UTC')}
    </table>

    <a href="${DOMAIN}/dashboard/merchant" style="display:inline-block;background:#C694F9;color:#000;font-size:13px;font-weight:900;padding:10px 24px;border-radius:50px;text-decoration:none;">
      View Payment History →
    </a>
  `);

  await sendEmail(email, `🧾 Payment to ${merchantName} — ₹${inrAmount.toFixed(2)} (${xlmAmount.toFixed(4)} XLM)`, html);
}

