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
  userId: string;
  balance: number;
  totalInvested: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: string;
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
  minAmount: number;
  dailyReturn: number; // 10% fixe
  duration: number; // 90 jours
  color: string;
}

export interface StakingLot {
  lot: number;
  duration: number; // en jours
  dailyRate: number; // % par jour
  totalReturn: number; // % total fin période
  minAmount: number;
}

export interface Investment {
  id: string;
  userId: string;
  type: 'vip' | 'stake';
  level?: number; // Pour VIP
  lot?: number; // Pour Staking
  amount: number;
  dailyReturn: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'commission' | 'bonus';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  description: string;
  createdAt: string;
  processedAt?: string;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  phoneNumber: string;
  transactionId: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  fees: number; // 6%
  netAmount: number;
  paymentMethod: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  createdAt: string;
  processedAt?: string;
}

export interface ReferralCommission {
  id: string;
  referrerId: string;
  referredId: string;
  investmentId: string;
  level: 1 | 2 | 3;
  rate: number; // 0.15, 0.03, 0.02
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: string;
  createdAt: string;
}

export interface DailyEarning {
  id: string;
  userId: string;
  investmentId: string;
  investmentType: 'vip' | 'stake';
  amount: number;
  earningDate: string;
  processedAt: string;
}

export interface GiftCode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  currentUses: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}