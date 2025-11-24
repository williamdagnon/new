import { VIP_LEVELS, REFERRAL_RATES } from '../constants';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};

export const calculateVIPDailyReturn = (amount: number, level: number): number => {
  const vipLevel = VIP_LEVELS.find(v => v.level === level);
  if (!vipLevel) return 0;
  return amount * vipLevel.daily_return;
};

export const calculateTotalReturn = (amount: number, level: number): number => {
  const vipLevel = VIP_LEVELS.find(v => v.level === level);
  if (!vipLevel) return 0;
  return amount * vipLevel.daily_return * vipLevel.duration;
};

export const calculateReferralCommission = (investmentAmount: number, level: 1 | 2 | 3): number => {
  const rates = {
    1: REFERRAL_RATES.level1,
    2: REFERRAL_RATES.level2,
    3: REFERRAL_RATES.level3,
  };
  return investmentAmount * rates[level];
};

export const calculateWithdrawalFees = (amount: number): { fees: number; netAmount: number } => {
  const fees = amount * 0.06; // 6%
  const netAmount = amount - fees;
  return { fees, netAmount };
};

export const getVIPLevelByAmount = (amount: number): VIPLevel | null => {
  // Trouve le niveau VIP le plus élevé accessible avec ce montant
  const eligibleLevels = VIP_LEVELS.filter(level => amount >= level.min_amount);
  return eligibleLevels.length > 0 ? eligibleLevels[eligibleLevels.length - 1] : null;
};


export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'APUIC';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  const patterns = {
    TG: /^[0-9]{8}$/, // Togo: 8 chiffres
    BJ: /^[0-9]{8}$/, // Bénin: 8 chiffres
    CI: /^[0-9]{8,10}$/, // Côte d'Ivoire: 8-10 chiffres
    BF: /^[0-9]{8}$/, // Burkina Faso: 8 chiffres
    CG: /^[0-9]{7,9}$/, // Congo: 7-9 chiffres
  };
  
  const pattern = patterns[countryCode as keyof typeof patterns];
  return pattern ? pattern.test(phone.replace(/\s/g, '')) : false;
};

export const maskPhoneNumber = (phone: string): string => {
  if (phone.length <= 4) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const middle = '*'.repeat(phone.length - 4);
  return `${start}${middle}${end}`;
};

export const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const calculateProgress = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  const progress = (elapsed / totalDuration) * 100;
  return Math.min(100, Math.max(0, progress));
};