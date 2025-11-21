import { Country, VIPLevel, StakingLot } from '../types';

export const COUNTRIES: Country[] = [
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228', color: '#228B22' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '+229', color: '#1E90FF' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '+225', color: '#FF8C00' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226', color: '#DC143C' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '+242', color: '#FFD700' },
];

export const VIP_LEVELS: VIPLevel[] = [
  { level: 1, name: 'VIP Bronze', minAmount: 3000, dailyReturn: 0.10, duration: 90, color: '#CD7F32' },
  { level: 2, name: 'VIP Silver', minAmount: 10000, dailyReturn: 0.10, duration: 90, color: '#C0C0C0' },
  { level: 3, name: 'VIP Gold', minAmount: 25000, dailyReturn: 0.10, duration: 90, color: '#FFD700' },
  { level: 4, name: 'VIP Platinum', minAmount: 50000, dailyReturn: 0.10, duration: 90, color: '#E5E4E2' },
  { level: 5, name: 'VIP Diamond', minAmount: 100000, dailyReturn: 0.10, duration: 90, color: '#B9F2FF' },
  { level: 6, name: 'VIP Elite', minAmount: 250000, dailyReturn: 0.10, duration: 90, color: '#800080' },
  { level: 7, name: 'VIP Master', minAmount: 500000, dailyReturn: 0.10, duration: 90, color: '#FF1493' },
  { level: 8, name: 'VIP Legend', minAmount: 1000000, dailyReturn: 0.10, duration: 90, color: '#FF4500' },
  { level: 9, name: 'VIP Supreme', minAmount: 2000000, dailyReturn: 0.10, duration: 90, color: '#8B0000' },
  { level: 10, name: 'VIP Ultimate', minAmount: 5000000, dailyReturn: 0.10, duration: 90, color: '#000000' },
];

// Plan de Staking basé sur l'image fournie
export const STAKING_LOTS: StakingLot[] = [
  { lot: 1, duration: 5, dailyRate: 5, totalReturn: 25, minAmount: 2500 },
  { lot: 2, duration: 10, dailyRate: 7, totalReturn: 70, minAmount: 2500 },
  { lot: 3, duration: 15, dailyRate: 8, totalReturn: 120, minAmount: 2500 },
  { lot: 4, duration: 20, dailyRate: 10, totalReturn: 200, minAmount: 2500 },
  { lot: 5, duration: 30, dailyRate: 11, totalReturn: 330, minAmount: 2500 },
  { lot: 6, duration: 45, dailyRate: 13, totalReturn: 585, minAmount: 2500 },
  { lot: 7, duration: 60, dailyRate: 15, totalReturn: 900, minAmount: 2500 },
];

export const REFERRAL_RATES = {
  level1: 0.15, // 15%
  level2: 0.03, // 3%
  level3: 0.02, // 2%
};

export const PLATFORM_CONFIG = {
  minDeposit: 3000,
  minWithdrawal: 1000,
  withdrawalFeeRate: 0.06, // 6%
  loginBonus: 25,
  supportHours: { start: 9, end: 18 },
  cycleDuration: 90, // jours
  validityPeriod: 40, // jours par cycle
};

export const SLOGAN = "5 pays. 1 vision. 90 jours pour transformer ton capital.";

export const PAYMENT_METHODS = [
  'Mobile Money',
  'Orange Money',
  'MTN Money',
  'Moov Money',
  'Wave',
  'Virement bancaire',
];