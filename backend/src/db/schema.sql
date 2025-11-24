-- ============================================
-- APUIC CAPITAL - Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  country_code VARCHAR(5) NOT NULL CHECK (country_code IN ('TG', 'BJ', 'CI', 'BF', 'CG')),
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- ============================================
-- WALLETS
-- ============================================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 0 CHECK (balance >= 0),
  total_invested DECIMAL(15, 2) DEFAULT 0,
  total_earned DECIMAL(15, 2) DEFAULT 0,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- ============================================
-- VIP PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS vip_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(15, 2) NOT NULL,
  daily_return DECIMAL(5, 4) NOT NULL DEFAULT 0.10, -- 10%
  duration INTEGER NOT NULL DEFAULT 90, -- days
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default VIP levels
INSERT INTO vip_products (level, name, min_amount, daily_return, duration, color) VALUES
(1, 'VIP Bronze', 3000, 0.10, 90, '#CD7F32'),
(2, 'VIP Silver', 10000, 0.10, 90, '#C0C0C0'),
(3, 'VIP Gold', 25000, 0.10, 90, '#FFD700'),
(4, 'VIP Platinum', 50000, 0.10, 90, '#E5E4E2'),
(5, 'VIP Diamond', 100000, 0.10, 90, '#B9F2FF'),
(6, 'VIP Elite', 250000, 0.10, 90, '#800080'),
(7, 'VIP Master', 500000, 0.10, 90, '#FF1493'),
(8, 'VIP Legend', 1000000, 0.10, 90, '#FF4500'),
(9, 'VIP Supreme', 2000000, 0.10, 90, '#8B0000'),
(10, 'VIP Ultimate', 5000000, 0.10, 90, '#000000')
ON CONFLICT (level) DO NOTHING;

-- ============================================
-- VIP INVESTMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS vip_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vip_level INTEGER NOT NULL REFERENCES vip_products(level),
  amount DECIMAL(15, 2) NOT NULL,
  daily_return_amount DECIMAL(15, 2) NOT NULL,
  purchase_time TIMESTAMP WITH TIME ZONE NOT NULL, -- Exact purchase time
  next_earning_time TIMESTAMP WITH TIME ZONE NOT NULL, -- Next 24h earning time
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  days_elapsed INTEGER DEFAULT 0,
  total_earned DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vip_investments_user_id ON vip_investments(user_id);
CREATE INDEX idx_vip_investments_status ON vip_investments(status);
CREATE INDEX idx_vip_investments_next_earning ON vip_investments(next_earning_time);

-- ============================================
-- DAILY EARNINGS (VIP)
-- ============================================

CREATE TABLE IF NOT EXISTS daily_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES vip_investments(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  earning_date DATE NOT NULL, -- Date of the earning
  earning_time TIMESTAMP WITH TIME ZONE NOT NULL, -- Exact time of earning
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(investment_id, earning_date) -- Prevent duplicate earnings for same day
);

CREATE INDEX idx_daily_earnings_user_id ON daily_earnings(user_id);
CREATE INDEX idx_daily_earnings_investment_id ON daily_earnings(investment_id);
CREATE INDEX idx_daily_earnings_date ON daily_earnings(earning_date);

-- ============================================
-- DEPOSITS
-- ============================================

CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL, -- MTN, MOOV, Tmoney, etc.
  account_number VARCHAR(50) NOT NULL, -- User's payment account
  transaction_id VARCHAR(255), -- External transaction ID
  transfer_id VARCHAR(255), -- Transfer ID from payment gateway
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  is_first_deposit BOOLEAN DEFAULT false, -- Track if this is user's first deposit
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_created_at ON deposits(created_at);

-- ============================================
-- WITHDRAWALS
-- ============================================

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  fees DECIMAL(15, 2) NOT NULL DEFAULT 0, -- 6% fee
  net_amount DECIMAL(15, 2) NOT NULL,
  bank_id UUID REFERENCES banks(id) ON DELETE SET NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at);

-- Track daily withdrawal count per user
CREATE INDEX idx_withdrawals_user_date ON withdrawals(user_id, DATE(created_at));

-- ============================================
-- BANKS (Managed by Admin)
-- ============================================

CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  country_code VARCHAR(5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default banks
INSERT INTO banks (name, code, country_code) VALUES
('Banque du Togo', 'BT', 'TG'),
('Banque du Bénin', 'BB', 'BJ'),
('Banque du Burkina Faso', 'BBF', 'BF'),
('Banque du Cameroun', 'BC', 'CM'),
('MTN Mobile Money', 'MTN', NULL),
('MOOV Money', 'MOOV', NULL),
('Tmoney', 'TMONEY', NULL),
('Orange Money', 'ORANGE', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- REFERRAL COMMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deposit_id UUID NOT NULL REFERENCES deposits(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  rate DECIMAL(5, 4) NOT NULL, -- 0.30, 0.03, 0.03
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referral_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX idx_referral_commissions_referred ON referral_commissions(referred_id);
CREATE INDEX idx_referral_commissions_deposit ON referral_commissions(deposit_id);

-- ============================================
-- TRANSACTIONS (General)
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'earning', 'commission', 'bonus', 'vip_purchase')),
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  description TEXT,
  reference_id UUID, -- Reference to deposit, withdrawal, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================
-- ACTIVITY LOGS (Admin)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ============================================
-- SYSTEM CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config
INSERT INTO system_config (key, value, description) VALUES
('min_deposit', '3000', 'Minimum deposit amount'),
('min_withdrawal', '1000', 'Minimum withdrawal amount'),
('withdrawal_fee_rate', '0.06', 'Withdrawal fee rate (6%)'),
('max_daily_withdrawals', '2', 'Maximum withdrawals per user per day'),
('referral_rates', '{"level1": 0.30, "level2": 0.03, "level3": 0.03}', 'Referral commission rates'),
('vip_daily_return', '0.10', 'VIP daily return rate (10%)'),
('vip_duration', '90', 'VIP investment duration in days')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vip_products_updated_at BEFORE UPDATE ON vip_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vip_investments_updated_at BEFORE UPDATE ON vip_investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create wallet for new user
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, total_invested, total_earned, total_withdrawn)
  VALUES (NEW.id, 0, 0, 0, 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_wallet_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();
