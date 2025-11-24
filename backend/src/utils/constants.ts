export const REFERRAL_RATES = {
  level1: 0.30, // 30%
  level2: 0.03, // 3%
  level3: 0.03, // 3%
};

export const PLATFORM_CONFIG = {
  minDeposit: 3000,
  minWithdrawal: 1000,
  withdrawalFeeRate: 0.06, // 6%
  maxDailyWithdrawals: 2,
  vipDailyReturn: 0.10, // 10%
  vipDuration: 90, // days
};

export const VIP_LEVELS = [
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

export const PAYMENT_METHODS = [
  'MTN Mobile Money',
  'MOOV Money',
  'Tmoney',
  'Orange Money',
  'Wave',
  'Virement bancaire',
];
