export interface UserType {
  id: string;
  phone: string;
  country: 'TG' | 'BJ' | 'CI' | 'BF' | 'CG';
  referralCode: string;
  referredBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface Country {
  code: 'TG' | 'BJ' | 'CI' | 'BF' | 'CG';
  name: string;
  flag: string;
  dialCode: string;
  color: string;
}

export interface VIPLevel {
  level: number;
  name: string;
  min_amount: number;
  daily_return: number; // 10% fixe
  duration: number; // 90 jours
  color: string;
}

export interface VIPProduct extends VIPLevel {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Staking removed completely

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
  is_first_deposit: boolean;
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  fees: number; // 6%
  net_amount: number;
  bank_id?: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface Bank {
  id: string;
  name: string;
  code?: string;
  countryCode?: string;
  isActive: boolean;
}

export interface ReferralCommission {
  id: string;
  referrer_id: string;
  referred_id: string;
  deposit_id: string;
  level: 1 | 2 | 3;
  rate: number; // 0.30, 0.03, 0.03
  amount: number;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
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

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: Omit<UserType, 'password'>;
  wallet: Wallet;
  token: string;
}
