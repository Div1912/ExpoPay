#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, symbol_short};

// ── Constants ────────────────────────────────────────────────────────────────
const LEDGERS_PER_DAY: u64 = 17280; // ~5s per ledger

// ── Data types ───────────────────────────────────────────────────────────────
#[derive(Clone)]
#[contracttype]
pub struct Stake {
    pub stake_id:       u64,
    pub staker:         Address,
    pub amount:         i128,   // EXPO tokens locked (in stroops)
    pub start_ledger:   u64,
    pub unlock_ledger:  u64,
    pub duration_days:  u32,    // 30 | 60 | 90
    pub reward_bps:     u32,    // flat reward rate in basis points
    pub claimed:        bool,
}

#[contracttype]
pub enum DataKey {
    Stake(u64),       // stake_id -> Stake
    StakeCount,       // u64
    ExpoToken,        // Address
    Admin,            // Address
    RewardPool,       // i128 - EXPO available for rewards
    TotalStaked,      // i128
}

// ── Contract ─────────────────────────────────────────────────────────────────
#[contract]
pub struct StakingContract;

#[contractimpl]
impl StakingContract {

    /// One-time initializer. Sets admin and EXPO token address.
    pub fn initialize(env: Env, admin: Address, expo_token: Address) {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin,      &admin);
        env.storage().instance().set(&DataKey::ExpoToken,  &expo_token);
        env.storage().instance().set(&DataKey::StakeCount, &0u64);
        env.storage().instance().set(&DataKey::TotalStaked,&0i128);
        env.storage().instance().set(&DataKey::RewardPool, &0i128);
        env.storage().instance().extend_ttl(500, 500);
    }

    /// Admin pre-funds the reward pool with EXPO tokens.
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

    /// Stake EXPO tokens for 30, 60, or 90 days.
    /// Returns the new stake_id.
    pub fn stake(env: Env, staker: Address, amount: i128, duration_days: u32) -> u64 {
        staker.require_auth();

        if amount <= 0 { panic!("Amount must be positive"); }

        // Reward rates (flat, not APR) — the full reward pays out at maturity
        // 30d → 1.25%, 60d → 3.00%, 90d → 6.00%
        let reward_bps: u32 = match duration_days {
            30 => 125,   // 1.25%
            60 => 300,   // 3.00%
            90 => 600,   // 6.00%
            _  => panic!("Duration must be 30, 60, or 90 days"),
        };

        let projected_reward = (amount * reward_bps as i128) / 10000;
        let pool: i128 = env.storage().instance().get(&DataKey::RewardPool).unwrap_or(0);
        if pool < projected_reward {
            panic!("Reward pool insufficient — contact admin");
        }

        // Transfer EXPO from staker into contract
        let expo_token: Address = env.storage().instance().get(&DataKey::ExpoToken).unwrap();
        let token = token::Client::new(&env, &expo_token);
        token.transfer(&staker, &env.current_contract_address(), &amount);

        // Reserve the reward from pool immediately (prevents double-commit)
        env.storage().instance().set(&DataKey::RewardPool, &(pool - projected_reward));

        let count: u64 = env.storage().instance().get(&DataKey::StakeCount).unwrap_or(0);
        let stake_id = count + 1;
        let current = env.ledger().sequence() as u64;

        let s = Stake {
            stake_id,
            staker: staker.clone(),
            amount,
            start_ledger:  current,
            unlock_ledger: current + (duration_days as u64 * LEDGERS_PER_DAY),
            duration_days,
            reward_bps,
            claimed: false,
        };

        env.storage().instance().set(&DataKey::Stake(stake_id), &s);
        env.storage().instance().set(&DataKey::StakeCount, &stake_id);

        let total: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total + amount));

        env.events().publish((symbol_short!("staked"),), (staker, amount, duration_days));
        env.storage().instance().extend_ttl(500, 500);

        stake_id
    }

    /// Unstake after lock period — returns principal + rewards.
    pub fn unstake(env: Env, staker: Address, stake_id: u64) -> i128 {
        staker.require_auth();

        let mut s: Stake = env.storage().instance()
            .get(&DataKey::Stake(stake_id))
            .expect("Stake not found");

        if s.staker != staker  { panic!("Not your stake"); }
        if s.claimed            { panic!("Already claimed"); }

        let now = env.ledger().sequence() as u64;
        if now < s.unlock_ledger { panic!("Stake is still locked"); }

        let reward    = (s.amount * s.reward_bps as i128) / 10000;
        let payout    = s.amount + reward;

        let expo_token: Address = env.storage().instance().get(&DataKey::ExpoToken).unwrap();
        let token = token::Client::new(&env, &expo_token);
        token.transfer(&env.current_contract_address(), &staker, &payout);

        s.claimed = true;
        env.storage().instance().set(&DataKey::Stake(stake_id), &s);

        let total: i128 = env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalStaked, &(total - s.amount));

        env.events().publish((symbol_short!("unstaked"),), (staker, payout, reward));
        env.storage().instance().extend_ttl(500, 500);

        payout
    }

    // ── View functions ─────────────────────────────────────────────────────

    pub fn get_stake(env: Env, stake_id: u64) -> Stake {
        env.storage().instance().extend_ttl(100, 100);
        env.storage().instance()
            .get(&DataKey::Stake(stake_id))
            .expect("Stake not found")
    }

    /// Preview reward for a given stake (works before unlock too).
    pub fn get_reward(env: Env, stake_id: u64) -> i128 {
        env.storage().instance().extend_ttl(100, 100);
        let s: Stake = env.storage().instance()
            .get(&DataKey::Stake(stake_id))
            .expect("Stake not found");
        (s.amount * s.reward_bps as i128) / 10000
    }

    pub fn get_total_staked(env: Env) -> i128 {
        env.storage().instance().extend_ttl(100, 100);
        env.storage().instance().get(&DataKey::TotalStaked).unwrap_or(0)
    }

    pub fn get_reward_pool(env: Env) -> i128 {
        env.storage().instance().extend_ttl(100, 100);
        env.storage().instance().get(&DataKey::RewardPool).unwrap_or(0)
    }
}
