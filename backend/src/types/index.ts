// Re-export frontend types and add backend-specific types
export type CountryCode = 'TG' | 'BJ' | 'CI' | 'BF' | 'CG';

export interface User {
  id: string;
  phone: string;
  country_code: CountryCode;
  password_hash: string;
  full_name?: string;
  referral_code: string;
  referred_by?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_invested: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface VIPProduct {
  id: string;
  level: number;
  name: string;
  min_amount: number;
  daily_return: number;
  duration: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VIPInvestment {
  id: string;
  user_id: string;
  vip_level: number;
  amount: number;
  daily_return_amount: number;
  purchase_time: string; // Exact purchase time
  next_earning_time: string; // Next 24h earning time
  start_date: string;
  end_date: string;
  days_elapsed: number;
  total_earned: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DailyEarning {
  id: string;
  user_id: string;
  investment_id: string;
  amount: number;
  earning_date: string;
  earning_time: string;
  processed_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  account_number: string;
  transaction_id?: string;
  transfer_id?: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  is_first_deposit: boolean;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  fees: number;
  net_amount: number;
  bank_id?: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Bank {
  id: string;
  name: string;
  code?: string;
  country_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReferralCommission {
  id: string;
  referrer_id: string;
  referred_id: string;
  deposit_id: string;
  level: 1 | 2 | 3;
  rate: number;
  amount: number;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'commission' | 'bonus' | 'vip_purchase';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  description?: string;
  reference_id?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  admin_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SystemConfig {
  key: string;
  value: any;
  description?: string;
  updated_at: string;
}

// Request/Response types
export interface LoginRequest {
  phone: string;
  password: string;
  country_code: CountryCode;
}

export interface SignupRequest {
  phone: string;
  password: string;
  full_name: string;
  country_code: CountryCode;
  referral_code?: string;
  otp?: string;
}

export interface VIPPurchaseRequest {
  vip_level: number;
  amount: number;
}

export interface DepositRequest {
  amount: number;
  payment_method: string;
  account_number: string;
  transaction_id?: string;
  transfer_id?: string;
  receipt_url?: string;
}

export interface WithdrawalRequest {
  amount: number;
  bank_id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  wallet: Wallet;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
