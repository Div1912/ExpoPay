# ExpoPay User Guide

## Getting Started

### 1. Sign Up

1. Visit [exporouter.site](https://exporouter.site)
2. Click **Sign Up** and enter your email and password  
   (or click **Sign in with Google** for one-tap signup)
3. Verify your email if prompted

### 2. Claim Your Universal ID

Your Universal ID is your permanent @expo address — like `alice@expo`.

1. After signup, you'll be taken to the **Onboarding** page
2. Choose your **@expo username** (lowercase, no spaces, e.g. `alice`)
3. Enter your **full name** and **phone number**
4. Set a **4-digit transaction PIN** (you'll need this for every payment)
5. Choose your **preferred currency** (XLM, USDC, INR, USD, EUR, GBP)
6. Click **Claim My Account**

> ⚠️ Your username is permanent — choose carefully!

A Stellar wallet is automatically created and funded via Friendbot (testnet). Your balance will appear on the dashboard within seconds.

---

## Sending Money

### Standard Send (P2P)

1. From the dashboard, click **SEND** or navigate to **Send Money** in the sidebar
2. In the **To** field, type a `@expo` username (e.g. `bob@expo`) or start typing — suggestions appear
3. Enter the **amount** and select your **currency**
4. Optionally add a **note** or **purpose**
5. Click **Send**
6. Enter your **4-digit PIN** to confirm
7. Done! The transaction settles on Stellar in ~3 seconds

### Gasless Send ⚡ (Fee Sponsored)

Gasless payments are identical to standard sends, but **the platform pays the XLM network fee** on your behalf.

1. On the Send page, toggle **Gasless ⚡** (if available)
2. Complete the send as normal
3. The confirmation will show: *"Transaction fee sponsored by ExpoPay"*
4. On Stellar Expert, the `fee_source` will show the platform wallet (not yours)

> **Note:** Gasless availability depends on the platform wallet having sufficient XLM.

---

## Receiving Money

1. Go to **My Code** (sidebar) or click **RECEIVE** on the dashboard
2. Share your QR code — anyone with the app can scan it to send directly to you
3. Or share your **@expo ID** verbally: just say `alice@expo`
4. The sender enters your ID in their Send page and the payment arrives instantly

---

## Paying Merchants (UPI Bridge)

Pay any Indian UPI QR code with your Stellar crypto balance.

1. Go to **Pay Merchant** in the sidebar
2. Either:
   - Click **Scan QR** and point your camera at a UPI QR code, or
   - Select a demo merchant from the list
3. The app shows a live **XLM → INR conversion quote** with a 30-second lock window
4. Enter your PIN and confirm
5. The INR amount is credited to the merchant's UPI account; your XLM is debited

---

## Split Bills

Split any expense among `@expo` users.

### Creating a Split

1. Go to **Split Bills** in the sidebar
2. Click **New Split**
3. Enter the bill **title**, **total amount**, and **currency**
4. Add participants by typing their `@expo` username
5. Choose **Equal split** (automatic) or **Custom** (enter each person's share manually)
6. Click **Create Bill**

### Paying Your Share

When someone adds you to a split:
1. You'll receive an in-app notification and email
2. Go to **Split Bills** → find the bill
3. Click **Pay My Share**
4. Confirm with your PIN

The creator is paid directly; the bill status updates to `partial` → `paid` as participants settle.

---

## Vault (Staking + Yield Pool)

### Staking EXPO Tokens

Lock your EXPO tokens to earn fixed rewards:

| Period | Reward | Approx. APR |
|--------|--------|-------------|
| 30 days | 1.25% | ~15% |
| 60 days | 3.00% | ~18% |
| 90 days | 6.00% | ~24% |

1. Go to **Vault** in the sidebar
2. Under **EXPO Staking**, enter an amount and select a lock period
3. Use the **Compound Projection** slider to see projected returns
4. Click **Stake** and confirm with your PIN
5. Your stake appears with a live countdown and accrued reward ticker
6. At maturity, click **Unstake** to receive principal + reward

### XLM Yield Pool

Deposit XLM with **no lock-up** and earn EXPO rewards at ~18% APR.

1. Go to **Vault** → **Yield Pool** tab
2. Enter the XLM amount and click **Deposit**
3. Rewards accrue at 0.5% per XLM per day
4. Click **Withdraw** anytime to receive your XLM + accrued EXPO

---

## Escrow Contracts

Secure milestone payments for freelancers and clients.

### As a Client (Payer)

1. Go to **Contracts** → **New Contract**
2. Enter the freelancer's `@expo` ID, amount, title, and description
3. Set an **expiry date** (e.g., 30 days)
4. Click **Create** — this registers the contract on-chain (Soroban)
5. Click **Fund** and enter your PIN — EXPO tokens are locked in the contract
6. When the freelancer marks work as delivered, you can:
   - Click **Release** to pay the freelancer ✓
   - Click **Dispute** if something went wrong

### As a Freelancer

1. The client shares the contract with you (you can see it under **Contracts**)
2. Complete the work, then click **Mark as Delivered**
3. Wait for the client to release — you'll receive an email notification
4. If the client disputes, an **Arbiter** will review and resolve

### Dispute Resolution

Disputes are reviewed by the ExpoPay arbiter:
- The arbiter can **Force Pay Freelancer** or **Force Refund Client**
- Resolution is on-chain; both parties receive email notifications

---

## Security Tips

- **Never share your PIN** — ExpoPay will never ask for your PIN via email or chat
- **Log out** when using a shared device — or let the 15-minute auto-logout protect you
- **Verify on Stellar Expert** — every transaction has a link to [stellar.expert](https://stellar.expert/explorer/testnet) for independent verification
- **Testnet only** — all funds are on Stellar Testnet and have no real monetary value

---

## Troubleshooting

**Q: My balance shows 0 after signup**  
A: Wait 15–30 seconds for Friendbot to fund your account, then refresh.

**Q: "Recipient not found" when sending**  
A: Double-check the @expo username — it's case-sensitive. The `@expo` suffix is added automatically.

**Q: PIN rejected but I entered it correctly**  
A: Make sure you're entering the 4-digit PIN you set during onboarding. If forgotten, use **Settings → Change PIN** (requires email OTP verification).

**Q: Gasless payment not available**  
A: The platform wallet needs sufficient XLM to sponsor fees. Fall back to standard send.

**Q: Transaction shows "failed" in history**  
A: Check the Stellar Explorer link next to the transaction for the specific error. Common causes: insufficient balance, destination not found.

---

## Contact & Support

- **In-app**: Go to **Support** in the dashboard
- **GitHub**: [github.com/Div1912/ExpoPay](https://github.com/Div1912/ExpoPay/issues)
- **Live App**: [exporouter.site](https://exporouter.site)
