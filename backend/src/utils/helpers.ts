import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../types';
import { generateUUID, generateUUIDNoDash } from './uuid';

const JWT_SECRET: string = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: Omit<User, 'password_hash'>): string => {
  return jwt.sign(
    { 
      id: user.id, 
      phone: user.phone, 
      is_admin: user.is_admin 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'APUIC';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};

export const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  const patterns: Record<string, RegExp> = {
    TG: /^[0-9]{8}$/,
    BJ: /^[0-9]{8}$/,
    CI: /^[0-9]{8,10}$/,
    BF: /^[0-9]{8}$/,
    CG: /^[0-9]{7,9}$/,
  };
  
  const pattern = patterns[countryCode];
  return pattern ? pattern.test(phone.replace(/\s/g, '')) : false;
};

export const getTodayStart = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getTodayEnd = (): Date => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
};

// Format date for MySQL (YYYY-MM-DD HH:MM:SS)
export const formatMySQLDate = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

export { generateUUID, generateUUIDNoDash };
