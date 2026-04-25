-- ExpoPay SAVINGS Feature Migration
-- Run in Supabase SQL Editor

-- EXPO Staking positions
CREATE TABLE IF NOT EXISTS staking_positions (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID    REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  universal_id   TEXT    NOT NULL,
  stake_id       BIGINT  NOT NULL,           -- on-chain stake_id (u64)
  amount_expo    DECIMAL(18,7) NOT NULL,      -- EXPO staked
  duration_days  INT     NOT NULL,            -- 30 | 60 | 90
  reward_bps     INT     NOT NULL,            -- basis points reward
  reward_expo    DECIMAL(18,7) NOT NULL,      -- projected reward
  status         TEXT    NOT NULL DEFAULT 'active', -- active | completed | early_exit
  tx_hash_stake  TEXT,
  tx_hash_unstake TEXT,
  staked_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  unlocks_at     TIMESTAMPTZ NOT NULL,        -- computed at creation
  unstaked_at    TIMESTAMPTZ
);

-- XLM Pool positions
CREATE TABLE IF NOT EXISTS pool_positions (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  universal_id    TEXT    NOT NULL,
  position_id     BIGINT  NOT NULL,           -- on-chain position_id (u64)
  amount_xlm      DECIMAL(18,7) NOT NULL,     -- XLM deposited
  expo_earned     DECIMAL(18,7) DEFAULT 0,    -- EXPO earned at withdrawal
  status          TEXT    NOT NULL DEFAULT 'active', -- active | withdrawn
  tx_hash_deposit  TEXT,
  tx_hash_withdraw TEXT,
  deposited_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at    TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staking_user   ON staking_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_status ON staking_positions(status);
CREATE INDEX IF NOT EXISTS idx_pool_user      ON pool_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_pool_status    ON pool_positions(status);

-- RLS
ALTER TABLE staking_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_positions     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staking_select" ON staking_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "staking_insert" ON staking_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "staking_update" ON staking_positions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pool_select" ON pool_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pool_insert" ON pool_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pool_update" ON pool_positions FOR UPDATE USING (auth.uid() = user_id);
