import { Country, VIPLevel } from '../types';

export const COUNTRIES: Country[] = [
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228', color: '#228B22' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '+229', color: '#1E90FF' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '+225', color: '#FF8C00' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226', color: '#DC143C' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', dialCode: '+242', color: '#FFD700' },
];

export const VIP_LEVELS: VIPLevel[] = [
  { level: 1, name: 'VIP Bronze', min_amount: 3000, daily_return: 0.10, duration: 90, color: '#CD7F32' },
  { level: 2, name: 'VIP Silver', min_amount: 10000, daily_return: 0.10, duration: 90, color: '#C0C0C0' },
  { level: 3, name: 'VIP Gold', min_amount: 25000, daily_return: 0.10, duration: 90, color: '#FFD700' },
  { level: 4, name: 'VIP Platinum', min_amount: 50000, daily_return: 0.10, duration: 90, color: '#E5E4E2' },
  { level: 5, name: 'VIP Diamond', min_amount: 100000, daily_return: 0.10, duration: 90, color: '#B9F2FF' },
  { level: 6, name: 'VIP Elite', min_amount: 250000, daily_return: 0.10, duration: 90, color: '#800080' },
  { level: 7, name: 'VIP Master', min_amount: 500000, daily_return: 0.10, duration: 90, color: '#FF1493' },
  { level: 8, name: 'VIP Legend', min_amount: 1000000, daily_return: 0.10, duration: 90, color: '#FF4500' },
  { level: 9, name: 'VIP Supreme', min_amount: 2000000, daily_return: 0.10, duration: 90, color: '#8B0000' },
  { level: 10, name: 'VIP Ultimate', min_amount: 5000000, daily_return: 0.10, duration: 90, color: '#000000' },
];

// Staking removed completely

export const REFERRAL_RATES = {
  level1: 0.30, // 30%
  level2: 0.03, // 3%
  level3: 0.03, // 3%
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
  'MTN Mobile Money',
  'MOOV Money',
  'Tmoney',
  'Orange Money',
  'Wave',
  'Virement bancaire',
];