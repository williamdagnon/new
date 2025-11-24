-- ============================================
-- APUIC CAPITAL - Database Schema (MySQL)
-- Version corrigée - Syntaxe MySQL valide
-- ============================================

-- ============================================
-- IMPORTANT: Run these commands first in MySQL
-- ============================================
-- CREATE DATABASE IF NOT EXISTS apuic_capital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE apuic_capital;
-- ============================================

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  country_code VARCHAR(5) NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_phone (phone),
  INDEX idx_users_referral_code (referral_code),
  INDEX idx_users_referred_by (referred_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key after table creation
ALTER TABLE users ADD FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- WALLETS
-- ============================================

CREATE TABLE IF NOT EXISTS wallets (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) UNIQUE NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  total_invested DECIMAL(15, 2) DEFAULT 0,
  total_earned DECIMAL(15, 2) DEFAULT 0,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wallets_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE wallets ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- VIP PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS vip_products (
  id CHAR(36) PRIMARY KEY,
  level INT UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(15, 2) NOT NULL,
  daily_return DECIMAL(5, 4) NOT NULL DEFAULT 0.10,
  duration INT NOT NULL DEFAULT 90,
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vip_products_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default VIP levels
INSERT IGNORE INTO vip_products (id, level, name, min_amount, daily_return, duration, color) VALUES
(UUID(), 1, 'VIP Bronze', 3000, 0.10, 90, '#CD7F32'),
(UUID(), 2, 'VIP Silver', 10000, 0.10, 90, '#C0C0C0'),
(UUID(), 3, 'VIP Gold', 25000, 0.10, 90, '#FFD700'),
(UUID(), 4, 'VIP Platinum', 50000, 0.10, 90, '#E5E4E2'),
(UUID(), 5, 'VIP Diamond', 100000, 0.10, 90, '#B9F2FF'),
(UUID(), 6, 'VIP Elite', 250000, 0.10, 90, '#800080'),
(UUID(), 7, 'VIP Master', 500000, 0.10, 90, '#FF1493'),
(UUID(), 8, 'VIP Legend', 1000000, 0.10, 90, '#FF4500'),
(UUID(), 9, 'VIP Supreme', 2000000, 0.10, 90, '#8B0000'),
(UUID(), 10, 'VIP Ultimate', 5000000, 0.10, 90, '#000000');

-- ============================================
-- VIP INVESTMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS vip_investments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  vip_level INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  daily_return_amount DECIMAL(15, 2) NOT NULL,
  purchase_time DATETIME NOT NULL,
  next_earning_time DATETIME NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  days_elapsed INT DEFAULT 0,
  total_earned DECIMAL(15, 2) DEFAULT 0,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vip_investments_user_id (user_id),
  INDEX idx_vip_investments_status (status),
  INDEX idx_vip_investments_next_earning (next_earning_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE vip_investments 
  ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (vip_level) REFERENCES vip_products(level);

-- ============================================
-- DAILY EARNINGS (VIP)
-- ============================================

CREATE TABLE IF NOT EXISTS daily_earnings (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  investment_id CHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  earning_date DATE NOT NULL,
  earning_time DATETIME NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_investment_date (investment_id, earning_date),
  INDEX idx_daily_earnings_user_id (user_id),
  INDEX idx_daily_earnings_investment_id (investment_id),
  INDEX idx_daily_earnings_date (earning_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE daily_earnings 
  ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (investment_id) REFERENCES vip_investments(id) ON DELETE CASCADE;

-- ============================================
-- BANKS (Managed by Admin)
-- ============================================

CREATE TABLE IF NOT EXISTS banks (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  country_code VARCHAR(5),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banks_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default banks
INSERT IGNORE INTO banks (id, name, code, country_code) VALUES
(UUID(), 'Banque du Togo', 'BT', 'TG'),
(UUID(), 'Banque du Bénin', 'BB', 'BJ'),
(UUID(), 'Banque du Burkina Faso', 'BBF', 'BF'),
(UUID(), 'Banque du Cameroun', 'BC', 'CM'),
(UUID(), 'MTN Mobile Money', 'MTN', NULL),
(UUID(), 'MOOV Money', 'MOOV', NULL),
(UUID(), 'Tmoney', 'TMONEY', NULL),
(UUID(), 'Orange Money', 'ORANGE', NULL);

-- ============================================
-- DEPOSITS
-- ============================================

CREATE TABLE IF NOT EXISTS deposits (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  transfer_id VARCHAR(255),
  receipt_url TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  is_first_deposit BOOLEAN DEFAULT FALSE,
  processed_by CHAR(36),
  processed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_deposits_user_id (user_id),
  INDEX idx_deposits_status (status),
  INDEX idx_deposits_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE deposits 
  ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- WITHDRAWALS
-- ============================================

CREATE TABLE IF NOT EXISTS withdrawals (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  fees DECIMAL(15, 2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(15, 2) NOT NULL,
  bank_id CHAR(36),
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  admin_notes TEXT,
  processed_by CHAR(36),
  processed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_withdrawals_user_id (user_id),
  INDEX idx_withdrawals_status (status),
  INDEX idx_withdrawals_created_at (created_at),
  INDEX idx_withdrawals_user_date (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE withdrawals 
  ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL,
  ADD FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- REFERRAL COMMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS referral_commissions (
  id CHAR(36) PRIMARY KEY,
  referrer_id CHAR(36) NOT NULL,
  referred_id CHAR(36) NOT NULL,
  deposit_id CHAR(36) NOT NULL,
  level INT NOT NULL,
  rate DECIMAL(5, 4) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'paid') DEFAULT 'pending',
  paid_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_referral_commissions_referrer (referrer_id),
  INDEX idx_referral_commissions_referred (referred_id),
  INDEX idx_referral_commissions_deposit (deposit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE referral_commissions 
  ADD FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (deposit_id) REFERENCES deposits(id) ON DELETE CASCADE;

-- ============================================
-- TRANSACTIONS (General)
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type ENUM('deposit', 'withdrawal', 'earning', 'commission', 'bonus', 'vip_purchase') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'completed',
  description TEXT,
  reference_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transactions_user_id (user_id),
  INDEX idx_transactions_type (type),
  INDEX idx_transactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE transactions ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- ACTIVITY LOGS (Admin)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  admin_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_logs_user_id (user_id),
  INDEX idx_activity_logs_admin_id (admin_id),
  INDEX idx_activity_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE activity_logs 
  ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  ADD FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- SYSTEM CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS system_config (
  config_key VARCHAR(100) PRIMARY KEY,
  config_value JSON NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default config
INSERT IGNORE INTO system_config (config_key, config_value, description) VALUES
('min_deposit', '"3000"', 'Minimum deposit amount'),
('min_withdrawal', '"1000"', 'Minimum withdrawal amount'),
('withdrawal_fee_rate', '0.06', 'Withdrawal fee rate (6%)'),
('max_daily_withdrawals', '"2"', 'Maximum withdrawals per user per day'),
('referral_rates', '{"level1": 0.30, "level2": 0.03, "level3": 0.03}', 'Referral commission rates'),
('vip_daily_return', '0.10', 'VIP daily return rate (10%)'),
('vip_duration', '90', 'VIP investment duration in days');

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create wallet for new user
DROP TRIGGER IF EXISTS create_wallet_on_user_creation;

DELIMITER //
CREATE TRIGGER create_wallet_on_user_creation
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO wallets (id, user_id, balance, total_invested, total_earned, total_withdrawn)
  VALUES (UUID(), NEW.id, 0, 0, 0, 0);
END//
DELIMITER ;
