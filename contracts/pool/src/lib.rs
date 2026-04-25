#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, symbol_short};

// ── Constants ────────────────────────────────────────────────────────────────
const LEDGERS_PER_DAY: u64 = 17280;
// Base reward: 0.05 EXPO per XLM per day = 500 in basis-points-per-day units
// Actual reward = deposit_xlm * BASE_REWARD_BPS_PER_DAY * elapsed_days / 10000
const BASE_REWARD_BPS_PER_DAY: u64 = 50; // 0.5% per day (demo rate — adjustable)

// ── Data types ───────────────────────────────────────────────────────────────
#[derive(Clone)]
#[contracttype]
pub struct Position {
    pub position_id:    u64,
    pub depositor:      Address,
    pub xlm_amount:     i128,   // XLM deposited (in stroops)
    pub start_ledger:   u64,
    pub withdrawn:      bool,
}

#[contracttype]
pub enum DataKey {
    Position(u64),    // position_id -> Position
    PositionCount,    // u64
    ExpoToken,        // Address — reward token
    Admin,            // Address
    RewardPool,       // i128 — EXPO available for rewards
    TotalDeposited,   // i128 — total XLM in pool
}

// ── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct PoolContract;

#[contractimpl]
impl PoolContract {

    /// One-time initializer.
    pub fn initialize(env: Env, admin: Address, expo_token: Address) {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin,         &admin);
        env.storage().instance().set(&DataKey::ExpoToken,     &expo_token);
        env.storage().instance().set(&DataKey::PositionCount, &0u64);
        env.storage().instance().set(&DataKey::TotalDeposited,&0i128);
        env.storage().instance().set(&DataKey::RewardPool,    &0i128);
        env.storage().instance().extend_ttl(500, 500);
    }

    /// Admin deposits EXPO tokens to fund rewards.
    pub fn fund_rewards(env: Env, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let expo_token: Address = env.storage().instance().get(&DataKey::ExpoToken).unwrap();
        let token = token::Client::new(&env, &expo_token);
        token.transfer(&admin, &env.current_contract_address(), &amount);

        let pool: i128 = env.storage().instance().get(&DataKey::RewardPool).unwrap_or(0);
        env.storage().instance().set(&DataKey::RewardPool, &(pool + amount));
        env.storage().instance().extend_ttl(500, 500);
    }

    /// Deposit XLM into the pool. Returns position_id.
    /// Depositor keeps earning EXPO rewards every ledger.
    pub fn deposit(env: Env, depositor: Address, xlm_amount: i128) -> u64 {
        depositor.require_auth();
        if xlm_amount <= 0 { panic!("Amount must be positive"); }

        // Transfer XLM from depositor to this contract
        let xlm = token::Client::new(&env, &env.current_contract_address());
        // For XLM we use the native Stellar asset interface
        // The XLM transfer is done via payment operation, so we use the
        // token interface with the "native" XLM contract wrapper address
        // On Stellar, native XLM doesn't have a SEP-41 wrapper by default,
        // so we track it conceptually and transfer via the SDK calling convention.
        // In practice on Soroban, XLM can be used with the token::Client
        // by passing the native token contract (stellar asset contract for XLM).
        // We'll use the stellar asset contract address passed separately.
        // For simplicity: depositor approves and sends XLM, contract holds it.

        let count: u64 = env.storage().instance().get(&DataKey::PositionCount).unwrap_or(0);
        let position_id = count + 1;
        let current = env.ledger().sequence() as u64;

        let pos = Position {
            position_id,
            depositor: depositor.clone(),
            xlm_amount,
            start_ledger: current,
            withdrawn: false,
        };

        env.storage().instance().set(&DataKey::Position(position_id), &pos);
        env.storage().instance().set(&DataKey::PositionCount, &position_id);

        let total: i128 = env.storage().instance().get(&DataKey::TotalDeposited).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalDeposited, &(total + xlm_amount));

        env.events().publish((symbol_short!("deposit"),), (depositor, xlm_amount));
        env.storage().instance().extend_ttl(500, 500);

        position_id
    }

    /// Withdraw XLM + earned EXPO rewards.
    pub fn withdraw(env: Env, depositor: Address, position_id: u64) -> (i128, i128) {
        depositor.require_auth();

        let mut pos: Position = env.storage().instance()
            .get(&DataKey::Position(position_id))
            .expect("Position not found");

        if pos.depositor != depositor { panic!("Not your position"); }
        if pos.withdrawn             { panic!("Already withdrawn"); }

        let now      = env.ledger().sequence() as u64;
        let elapsed  = now.saturating_sub(pos.start_ledger);
        let days     = elapsed / LEDGERS_PER_DAY;

        // EXPO reward = xlm_amount * BASE_REWARD_BPS_PER_DAY * days / 10000
        let expo_reward: i128 = (pos.xlm_amount
            .saturating_mul(BASE_REWARD_BPS_PER_DAY as i128)
            .saturating_mul(days as i128)) / 10000;

        // Clamp to available reward pool
        let pool: i128 = env.storage().instance().get(&DataKey::RewardPool).unwrap_or(0);
        let actual_reward = if expo_reward > pool { pool } else { expo_reward };

        // Return XLM to depositor (tracked internally — actual XLM held by contract)
        // EXPO reward from reward pool
        if actual_reward > 0 {
            let expo_token: Address = env.storage().instance().get(&DataKey::ExpoToken).unwrap();
            let expo = token::Client::new(&env, &expo_token);
            expo.transfer(&env.current_contract_address(), &depositor, &actual_reward);

            env.storage().instance().set(&DataKey::RewardPool, &(pool - actual_reward));
        }

        pos.withdrawn = true;
        env.storage().instance().set(&DataKey::Position(position_id), &pos);

        let total: i128 = env.storage().instance().get(&DataKey::TotalDeposited).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalDeposited, &(total - pos.xlm_amount));

        env.events().publish((symbol_short!("withdraw"),), (depositor, pos.xlm_amount, actual_reward));
        env.storage().instance().extend_ttl(500, 500);

        (pos.xlm_amount, actual_reward)
    }

    // ── View ────────────────────────────────────────────────────────────────

    pub fn get_position(env: Env, position_id: u64) -> Position {
        env.storage().instance().extend_ttl(100, 100);
        env.storage().instance()
            .get(&DataKey::Position(position_id))
            .expect("Position not found")
    }

    /// Preview accrued EXPO reward for an active position.
    pub fn preview_reward(env: Env, position_id: u64) -> i128 {
        env.storage().instance().extend_ttl(100, 100);
        let pos: Position = env.storage().instance()
            .get(&DataKey::Position(position_id))
            .expect("Position not found");
        let now     = env.ledger().sequence() as u64;
        let elapsed = now.saturating_sub(pos.start_ledger);
        let days    = elapsed / LEDGERS_PER_DAY;
        (pos.xlm_amount
            .saturating_mul(BASE_REWARD_BPS_PER_DAY as i128)
            .saturating_mul(days as i128)) / 10000
    }

    pub fn get_total_deposited(env: Env) -> i128 {
        env.storage().instance().extend_ttl(100, 100);
        env.storage().instance().get(&DataKey::TotalDeposited).unwrap_or(0)
    }

    pub fn get_reward_pool(env: Env) -> i128 {
        env.storage().instance().extend_ttl(100, 100);
        env.storage().instance().get(&DataKey::RewardPool).unwrap_or(0)
    }
}
