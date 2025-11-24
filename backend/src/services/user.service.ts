import { query, queryOne, execute } from '../config/database';
import { hashPassword, comparePassword, generateReferralCode, validatePhoneNumber } from '../utils/helpers';
import { generateUUID } from '../utils/uuid';
import { User, Wallet, SignupRequest, LoginRequest } from '../types';

export class UserService {
  async createUser(data: SignupRequest, referredByCode?: string): Promise<{ user: User; wallet: Wallet }> {
    // Validate phone number
    if (!validatePhoneNumber(data.phone, data.country_code)) {
      throw new Error('Invalid phone number format for this country');
    }

    // Check if phone already exists
    const existingUser = await queryOne<User>(
      'SELECT id FROM users WHERE phone = ? AND country_code = ?',
      [data.phone, data.country_code]
    );

    if (existingUser) {
      throw new Error('Phone number already registered');
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await queryOne<User>(
        'SELECT id FROM users WHERE referral_code = ?',
        [referralCode]
      );
      
      if (!existing) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Find referrer if referral code provided
    let referredBy = null;
    if (referredByCode) {
      const referrer = await queryOne<User>(
        'SELECT id FROM users WHERE referral_code = ?',
        [referredByCode.toUpperCase()]
      );
      
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);
    const userId = generateUUID();

    // Create user
    await execute(
      `INSERT INTO users (id, phone, country_code, password_hash, full_name, referral_code, referred_by, is_active, is_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, data.phone, data.country_code, passwordHash, data.full_name, referralCode, referredBy, true, false]
    );

    // Get created user
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Wallet is auto-created by trigger, fetch it
    const wallet = await queryOne<Wallet>(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    );

    if (!wallet) {
      throw new Error('Failed to create wallet');
    }

    return { user, wallet };
  }

  async login(data: LoginRequest): Promise<{ user: Omit<User, 'password_hash'>; wallet: Wallet }> {
    // Find user by phone
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE phone = ? AND country_code = ?',
      [data.phone, data.country_code]
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isValid = await comparePassword(data.password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Get wallet
    const wallet = await queryOne<Wallet>(
      'SELECT * FROM wallets WHERE user_id = ?',
      [user.id]
    );

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, wallet };
  }

  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await queryOne<User>(
      `SELECT id, phone, country_code, full_name, referral_code, referred_by, is_active, is_admin, created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    return user;
  }

  async getUserByPhone(phone: string, countryCode: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await queryOne<User>(
      `SELECT id, phone, country_code, full_name, referral_code, referred_by, is_active, is_admin, created_at, updated_at 
       FROM users WHERE phone = ? AND country_code = ?`,
      [phone, countryCode]
    );

    return user;
  }

  async getReferralTree(userId: string, level: number = 1, maxLevel: number = 3): Promise<any[]> {
    if (level > maxLevel) return [];

    const referrals = await query<{id: string; phone: string; full_name: string; referral_code: string; created_at: string}>(
      'SELECT id, phone, full_name, referral_code, created_at FROM users WHERE referred_by = ?',
      [userId]
    );

    if (!referrals || referrals.length === 0) return [];

    const result = [];
    for (const referral of referrals) {
      const children = await this.getReferralTree(referral.id, level + 1, maxLevel);
      result.push({
        ...referral,
        level,
        children
      });
    }

    return result;
  }
}