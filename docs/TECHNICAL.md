# ExpoPay Technical Documentation

## Table of Contents
1. [System Architecture](#architecture)
2. [API Reference](#api-reference)
3. [Smart Contracts](#smart-contracts)
4. [Database Schema](#database-schema)
5. [Environment Variables](#environment-variables)
6. [Deployment Guide](#deployment)
7. [Security Model](#security)

---

## Architecture

ExpoPay is a full-stack Next.js 15 application built on the Stellar blockchain with Supabase as the backend-as-a-service.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client (React / Next.js 15)                   │
│   Framer Motion · Tailwind CSS · Supabase Realtime Subscriptions │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST / JSON
┌──────────────────────────────▼──────────────────────────────────┐
│                   Server (Next.js API Routes)                     │
│  Auth · Payments · Escrow · Savings · Merchant · FX · Admin      │
└────┬──────────────┬──────────────────────┬───────────────────────┘
     │              │                      │
┌────▼────┐   ┌─────▼───────┐   ┌──────────▼───────────────────────┐
│Supabase │   │  Stellar     │   │   External Services              │
│Auth+DB  │   │  Horizon RPC │   │  Resend (email) · FX API · UPI  │
│Realtime │   │  Soroban RPC │   └──────────────────────────────────┘
└─────────┘   └─────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js API Routes for all blockchain calls | Keeps secret keys server-side; browser never sees Stellar private keys |
| Supabase Realtime | Low-latency WebSocket push for payment notifications without polling |
| Fee Bump transactions | Platform-sponsored fees remove UX barrier of users needing XLM for fees |
| Universal IDs (`alice@expo`) | Human-readable alternative to 56-char Stellar public keys |
| Custodial wallet (testnet) | Simplifies onboarding; non-custodial migration planned for mainnet |

---

## API Reference

All endpoints require a valid Supabase session cookie unless marked `[PUBLIC]`.  
Base URL: `https://exporouter.site`

### Authentication & Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/expo/claim` | Claim a Universal ID, create Stellar wallet | Session |
| GET | `/api/expo/profile` | Get authenticated user's profile | Session |
| GET | `/api/expo/balance` | Wallet balances (XLM, EXPO, converted) | Session |
| GET | `/api/expo/resolve?username=alice` | Resolve @expo ID → Stellar address | Session |
| GET | `/api/expo/check?username=alice` | Check username availability | Session |
| GET | `/api/expo/check-phone?phone=+91…` | Check phone number uniqueness | Session |
| POST | `/api/expo/pin` | Set or change 4-digit transaction PIN | Session |

**Example — Claim Universal ID:**
```bash
curl -X POST https://exporouter.site/api/expo/claim \
  -H "Content-Type: application/json" \
  -H "Cookie: <supabase-session>" \
  -d '{
    "username": "alice",
    "full_name": "Alice Smith",
    "phone_number": "+91-9876543210",
    "app_pin": "1234",
    "preferred_currency": "USDC"
  }'
# Response: { success: true, username, stellar_address, tx_hash }
```

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/send` | Standard P2P payment (sender pays fee) | Session + PIN |
| POST | `/api/payments/gasless` | Fee-bump payment (platform pays fee) ⚡ | Session + PIN |
| GET | `/api/payments/history` | User's P2P transaction history | Session |

**Example — Send Payment:**
```bash
curl -X POST https://exporouter.site/api/payments/send \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{
    "recipient": "bob@expo",
    "amount": "10",
    "currency": "USDC",
    "pin": "1234",
    "note": "Coffee money"
  }'
# Response: { success: true, tx_hash, amount_sent, currency, xlm_amount }
```

**Example — Gasless Payment:**
```bash
curl -X POST https://exporouter.site/api/payments/gasless \
  -H "Content-Type: application/json" \
  -H "Cookie: <session>" \
  -d '{
    "recipient": "bob@expo",
    "amount": "5",
    "currency": "XLM",
    "pin": "1234"
  }'
# Response: { success, gasless: true, tx_hash, fee_paid_by, xlm_amount }
```

### Escrow Contracts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/contracts` | List user's contracts | Session |
| POST | `/api/contracts` | Create new escrow | Session |
| POST | `/api/contracts/fund` | Fund an escrow (payer) | Session + PIN |
| POST | `/api/contracts/deliver` | Mark as delivered (freelancer) | Session |
| POST | `/api/contracts/release` | Release funds to freelancer (payer) | Session + PIN |
| POST | `/api/contracts/dispute` | Raise a dispute | Session |
| POST | `/api/contracts/refund` | Refund to payer | Session + PIN |
| GET | `/api/admin/contracts` | List disputed contracts (admin only) | Admin session |
| POST | `/api/admin/resolve` | Force-resolve dispute (admin only) | Admin session |

### Split Bills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/split` | List user's split bills |
| POST | `/api/split` | Create a split bill |
| GET | `/api/split/[id]` | Get bill details + participant statuses |
| POST | `/api/split/[id]/pay` | Pay current user's share |

### Vault (Staking + Pool)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/savings/positions` | All stakes + pool positions with live accrual |
| POST | `/api/savings/stake` | Stake EXPO tokens (30/60/90 days) |
| POST | `/api/savings/unstake` | Unstake matured position |
| POST | `/api/savings/pool/deposit` | Deposit XLM to yield pool |
| POST | `/api/savings/pool/withdraw` | Withdraw XLM + accrued EXPO |

### Merchant (UPI Bridge)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/merchant/quote` | Get XLM→INR conversion quote |
| POST | `/api/merchant/pay` | Process payment (crypto → simulated UPI) |
| GET | `/api/merchant/history` | Merchant payment history |

### FX

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fx/quote?from=XLM&to=INR` | Live exchange rate |

### Admin / Metrics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/metrics` | DAU, retention, volume stats | Admin |
| GET | `/api/admin/logs` | Application log stream | Admin |
| GET | `/api/admin/contracts` | Disputed contracts queue | Admin |
| POST | `/api/admin/resolve` | Force-resolve dispute | Admin |

---

## Smart Contracts

All contracts deployed on **Stellar Testnet** using Soroban.

### Escrow Contract (`CAGMD6PBDSOSB2NDOE5ZGYCWH74EOBJFHM627WTGLZZF66DBRUFWYSPT`)

```rust
fn create(env, payer, freelancer, token_id, amount, expiry) -> u64  // escrow_id
fn fund(env, payer, escrow_id)
fn deliver(env, freelancer, escrow_id)
fn release(env, payer, escrow_id)
fn dispute(env, caller, escrow_id, reason: String)
fn refund(env, payer, escrow_id)
fn get(env, escrow_id) -> EscrowState
```

### Staking Contract

```rust
fn init(env, token_address, admin)
fn stake(env, user, amount_expo, duration_days) -> u64  // stake_id
fn unstake(env, user, stake_id)
fn get_stake(env, stake_id) -> StakePosition
fn get_pool_balance(env) -> i128
fn fund_pool(env, admin, amount)
```

Reward tiers: 30d → 1.25% | 60d → 3.00% | 90d → 6.00%

### XLM Yield Pool Contract

```rust
fn init(env, expo_token, admin)
fn deposit(env, user, xlm_amount) -> u64  // position_id
fn withdraw(env, user, position_id)
fn get_position(env, position_id) -> PoolPosition
fn fund_rewards(env, admin, expo_amount)
```

Accrual: `expo_earned = xlm_deposited × 0.005 × elapsed_days` (~18% APR)

---

## Database Schema

### `profiles`
```sql
id uuid PRIMARY KEY,
universal_id text UNIQUE,      -- "alice" in alice@expo
stellar_address text,           -- G... public key
stellar_secret text,            -- S... secret key (encrypt before mainnet)
full_name text,
phone_number text UNIQUE,
preferred_currency text DEFAULT 'XLM',
app_pin text,                   -- 4-digit PIN (hash before mainnet)
avatar_url text,
created_at timestamptz DEFAULT now()
```

### `transactions`
```sql
id uuid PRIMARY KEY,
sender_id uuid → profiles.id,
recipient_id uuid → profiles.id,
sender_universal_id text,
recipient_universal_id text,
amount numeric,
currency text,
tx_hash text,
status text,              -- 'completed' | 'failed'
note text,
purpose text,
gasless boolean DEFAULT false,
fee_sponsor text,         -- platform public key if gasless
created_at timestamptz
```

### `contracts`
```sql
id uuid PRIMARY KEY,
escrow_id bigint,
payer_id uuid, freelancer_id uuid,
payer_universal_id text, freelancer_universal_id text,
amount numeric, currency text,
title text, description text,
status text,              -- 'created'|'funded'|'delivered'|'released'|'disputed'|'refunded'
expiry_timestamp timestamptz,
disputed_by text,
dispute_reason text,
tx_hash_create text, tx_hash_release text, tx_hash_refund text,
created_at timestamptz
```

### `app_logs` *(Black Belt)*
```sql
id uuid PRIMARY KEY,
level text,               -- 'info' | 'warn' | 'error'
event text,
route text,
user_id uuid,
meta jsonb,
created_at timestamptz DEFAULT now()
```

See `supabase_migration.sql`, `supabase_split_migration.sql`, `supabase_savings_migration.sql`, and `supabase_blackbelt_migration.sql` for complete DDL.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # REQUIRED in production

# Stellar
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
PLATFORM_SECRET_KEY=S...           # Platform wallet (fee sponsor, merchant settlement)

# Soroban contract IDs
ESCROW_CONTRACT_ID=CAGMD6PBDSOSB2NDOE5ZGYCWH74EOBJFHM627WTGLZZF66DBRUFWYSPT
TOKEN_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
STAKING_CONTRACT_ID=...
POOL_CONTRACT_ID=...
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CAGMD6PBDSOSB2NDOE5ZGYCWH74EOBJFHM627WTGLZZF66DBRUFWYSPT
NEXT_PUBLIC_TOKEN_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

# Email
RESEND_API_KEY=re_...
NOTIFY_FROM_EMAIL=ExpoPay <noreply@exporouter.site>

# Admin
ADMIN_EMAILS=your@email.com,another@email.com

# App
NEXT_PUBLIC_APP_URL=https://exporouter.site
```

---

## Deployment

### Vercel (Production)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard or:
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Supabase Setup

1. Create a new Supabase project
2. Run migrations in order in the SQL editor:
   - `supabase_migration.sql`
   - `supabase_split_migration.sql`
   - `supabase_savings_migration.sql`
   - `supabase_blackbelt_migration.sql`
3. Enable Realtime on tables: `transactions`, `contracts`, `split_bills`, `app_logs`
4. Configure Auth providers (Email/Password + Google OAuth)

### Stellar Contracts (Optional Re-deploy)

```bash
cd contracts/escrow
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source-account YOUR_ACCOUNT \
  --network testnet
```

---

## Security

See [SECURITY.md](./SECURITY.md) for the full security posture and checklist.

**Key principle:** All private keys are processed server-side only. The browser never receives a Stellar secret key.
