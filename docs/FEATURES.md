# ExpoPay Feature Documentation

This document provides a complete feature inventory for ExpoPay across product UX, APIs, contracts, admin tooling, and platform operations.

## 1) User-facing product features

### Authentication and access
- Email/password sign up and login
- Google OAuth login
- Email verification flow
- Forgot password + OTP verification + password reset
- Session-based access control for authenticated routes

### Onboarding and identity
- Universal ID claim (`username@expo`) with uniqueness checks
- Full profile setup (name, phone, preferred currency)
- Mandatory 4-digit transaction PIN setup
- Automatic Stellar testnet wallet creation and friendbot funding

### Dashboard and wallet experience
- Wallet summary with balances and quick actions
- Real-time transaction feed
- In-app notifications and payment status updates
- QR-based receive flow for direct wallet transfers
- QR scan flow for incoming pay links / merchant codes

### Payments
- P2P send to Universal ID
- PIN-protected payment confirmation
- Optional payment note/purpose metadata
- Cross-currency conversion with FX quote support
- Gasless payment mode (platform-sponsored network fee)
- Full payment history view

### Merchant payments (UPI bridge)
- Merchant quote flow (crypto to INR conversion)
- Merchant payment execution flow
- Merchant payment history tracking

### Escrow contracts
- Create escrow contracts for client/freelancer agreements
- Fund contracts from payer wallet
- Mark work as delivered
- Release escrow to freelancer
- Open disputes on conflicts
- Refund escrow where applicable
- Contract history and status tracking

### Split bills
- Create split bill with title, amount, and participants
- Equal split mode
- Custom share mode
- Split detail page with participant-level status
- Pay individual share from wallet
- Live status transitions (`active`, `partial`, `paid`)

### Vault / savings
- EXPO staking with fixed lock tiers (30/60/90 days)
- Stake maturity and unstake flow
- Compound projection visualization
- XLM yield pool deposit
- XLM yield pool withdrawal with accrued reward tracking
- Unified savings positions view

### Account and support
- Profile page with identity/account data
- Settings page for account preferences and PIN management
- Support page for user help and issue channels

## 2) Admin and operations features

### Admin console
- Admin dashboard landing page
- Metrics dashboard for platform usage/volume KPIs
- Monitoring view for operational signals
- Security view for security-specific admin insights

### Dispute administration
- List disputed contracts
- Resolve disputes with admin override actions

### Operational observability
- Admin logs API for backend event visibility
- Metrics API for analytics ingestion into admin UI

## 3) API feature map (all implemented routes)

### Identity and profile APIs
- `GET /api/expo/balance`
- `GET /api/expo/check`
- `GET /api/expo/check-phone`
- `POST /api/expo/claim`
- `POST /api/expo/pin`
- `GET /api/expo/profile`
- `GET /api/expo/resolve`

### Payment APIs
- `POST /api/payments/send`
- `POST /api/payments/gasless`
- `GET /api/payments/history`

### Merchant APIs
- `POST /api/merchant/quote`
- `POST /api/merchant/pay`
- `GET /api/merchant/history`

### Escrow APIs
- `GET /api/contracts`
- `POST /api/contracts`
- `POST /api/contracts/fund`
- `POST /api/contracts/deliver`
- `POST /api/contracts/release`
- `POST /api/contracts/dispute`
- `POST /api/contracts/refund`

### Split bill APIs
- `GET /api/split`
- `POST /api/split`
- `GET /api/split/[id]`
- `POST /api/split/[id]/pay`

### Savings APIs
- `GET /api/savings/positions`
- `POST /api/savings/stake`
- `POST /api/savings/unstake`
- `POST /api/savings/pool/deposit`
- `POST /api/savings/pool/withdraw`

### FX API
- `GET /api/fx/quote`

### Admin APIs
- `GET /api/admin/contracts`
- `GET /api/admin/logs`
- `GET /api/admin/metrics`
- `POST /api/admin/resolve`

## 4) Smart contract features

### Escrow contract (`contracts/escrow`)
- Escrow creation and funding lifecycle
- Delivery, release, dispute, and refund actions
- Contract state queries for UI synchronization

### Staking contract (`contracts/staking`)
- Stake position creation by amount and duration
- Unstake flow for matured positions
- On-chain stake position retrieval and pool accounting

### Pool contract (`contracts/pool`)
- Yield pool position deposits
- Position withdrawals
- Reward funding and position state retrieval

## 5) Data and persistence features

- Profile, transaction, and contract persistence in Supabase
- Split bill and participant tables with status tracking
- Staking and pool position tables for vault products
- Optional app log table for monitoring/audit records
- Realtime-enabled table updates for low-latency UX

## 6) Security and trust features

- Transaction PIN verification before money movement
- Server-side custody of sensitive signing operations
- Session-gated APIs for protected operations
- Admin-only authorization boundaries for dispute/metrics/logs APIs
- On-chain transaction hashes for independent verification
- Inactivity guard and auto-logout protections in the app experience

## 7) Platform and delivery features

- Next.js production build and runtime deployment support
- CI workflow automation in GitHub Actions
- Contract deployment workflow support for Soroban components
- Savings deployment workflow support
- Environment-variable driven configuration for app + contracts + services

## 8) Public website pages

- Landing page (`/`)
- Features page (`/features`)
- About page (`/about`)
- Support page (`/support`)

## 9) Auth and account pages

- Login page (`/auth/login`)
- Signup page (`/auth/signup`)
- Verify email page (`/auth/verify-email`)
- Forgot password page (`/auth/forgot-password`)
- Verify reset OTP page (`/auth/verify-reset-otp`)
- Update password page (`/auth/update-password`)

## 10) Core authenticated app pages

- Main dashboard (`/dashboard`)
- Send (`/dashboard/send`)
- Receive (`/dashboard/receive`)
- Scan (`/dashboard/scan`)
- History (`/dashboard/history`)
- Merchant (`/dashboard/merchant`)
- Contracts (`/dashboard/contracts`)
- Split list/new/detail (`/dashboard/split`, `/dashboard/split/new`, `/dashboard/split/[id]`)
- Savings overview/stake/pool (`/dashboard/savings`, `/dashboard/savings/stake`, `/dashboard/savings/pool`)
- Profile (`/dashboard/profile`)
- Settings (`/dashboard/settings`)
- Admin landing/metrics/monitoring/security (`/dashboard/admin`, `/dashboard/admin/metrics`, `/dashboard/admin/monitoring`, `/dashboard/admin/security`)
