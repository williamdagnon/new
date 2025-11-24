import { query, queryOne, execute } from '../config/database';
import { ReferralCommission } from '../types';
import { WalletService } from './wallet.service';
import { REFERRAL_RATES } from '../utils/constants';
import { generateUUID } from '../utils/uuid';

export class ReferralService {
  private walletService = new WalletService();

  /**
   * Process referral commissions for a deposit
   * Only processes on FIRST deposit
   * 3 levels: 30%, 3%, 3%
   */
  async processReferralCommissions(userId: string, depositId: string, depositAmount: number): Promise<void> {
    // Get user's referrer chain (up to 3 levels)
    const referrerChain = await this.getReferrerChain(userId, 3);

    if (referrerChain.length === 0) {
      return; // No referrers
    }

    for (let i = 0; i < referrerChain.length && i < 3; i++) {
      const referrerId = referrerChain[i];
      const level = (i + 1) as 1 | 2 | 3;
      
      // Get rate for this level
      const rate = level === 1 ? REFERRAL_RATES.level1 :
                   level === 2 ? REFERRAL_RATES.level2 :
                   REFERRAL_RATES.level3;

      const commissionAmount = depositAmount * rate;

      // Check if referrer is active
      const referrer = await queryOne<{id: string; is_active: boolean}>(
        'SELECT id, is_active FROM users WHERE id = ?',
        [referrerId]
      );

      if (!referrer || !referrer.is_active) {
        continue; // Skip inactive referrers
      }

      const commissionId = generateUUID();

      // Create commission record
      await execute(
        `INSERT INTO referral_commissions 
         (id, referrer_id, referred_id, deposit_id, level, rate, amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [commissionId, referrerId, userId, depositId, level, rate, commissionAmount, 'pending']
      );

      const commission = await queryOne<ReferralCommission>(
        'SELECT * FROM referral_commissions WHERE id = ?',
        [commissionId]
      );

      if (commission) {
        // Immediately pay the commission
        await this.payCommission(commission.id);
      }
    }
  }

  /**
   * Get referrer chain up to maxLevel
   */
  private async getReferrerChain(userId: string, maxLevel: number): Promise<string[]> {
    const chain: string[] = [];
    let currentUserId = userId;
    let level = 0;

    while (level < maxLevel) {
      const user = await queryOne<{referred_by: string | null}>(
        'SELECT referred_by FROM users WHERE id = ?',
        [currentUserId]
      );

      if (!user || !user.referred_by) {
        break;
      }

      chain.push(user.referred_by);
      currentUserId = user.referred_by;
      level++;
    }

    return chain;
  }

  /**
   * Pay a commission to referrer's wallet
   */
  async payCommission(commissionId: string): Promise<void> {
    const commission = await queryOne<ReferralCommission>(
      'SELECT * FROM referral_commissions WHERE id = ?',
      [commissionId]
    );

    if (!commission || commission.status === 'paid') {
      return;
    }

    // Add to referrer's wallet
    await this.walletService.updateBalance(commission.referrer_id, commission.amount, 'add');

    // Update wallet stats
    await this.walletService.updateWalletStats(commission.referrer_id, {
      total_earned: commission.amount
    });

    // Add transaction
    await this.walletService.addTransaction(
      commission.referrer_id,
      'commission',
      commission.amount,
      `Referral commission level ${commission.level}`,
      commission.id,
      'completed'
    );

    // Update commission status
    await execute(
      "UPDATE referral_commissions SET status = 'paid', paid_at = NOW() WHERE id = ?",
      [commissionId]
    );
  }

  async getUserCommissions(userId: string, limit: number = 50): Promise<ReferralCommission[]> {
    const commissions = await query<any>(
      `SELECT rc.*, u.phone as referred_phone, u.full_name as referred_name, d.amount as deposit_amount, d.payment_method
       FROM referral_commissions rc
       LEFT JOIN users u ON rc.referred_id = u.id
       LEFT JOIN deposits d ON rc.deposit_id = d.id
       WHERE rc.referrer_id = ?
       ORDER BY rc.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    return commissions || [];
  }

  async getReferralStats(userId: string): Promise<{
    total_referrals: number;
    total_commissions: number;
    level1_count: number;
    level2_count: number;
    level3_count: number;
  }> {
    const commissions = await query<{level: number; amount: number}>(
      'SELECT level, amount FROM referral_commissions WHERE referrer_id = ? AND status = ?',
      [userId, 'paid']
    );

    const totalCommissions = commissions?.reduce((sum: number, c: any) => sum + parseFloat(c.amount.toString()), 0) || 0;
    const level1Count = commissions?.filter((c: any) => c.level === 1).length || 0;
    const level2Count = commissions?.filter((c: any) => c.level === 2).length || 0;
    const level3Count = commissions?.filter((c: any) => c.level === 3).length || 0;

    // Count unique referrals
    const uniqueReferrals = await query<{referred_id: string}>(
      'SELECT DISTINCT referred_id FROM referral_commissions WHERE referrer_id = ? LIMIT 1000',
      [userId]
    );

    const uniqueCount = new Set(uniqueReferrals?.map((r: any) => r.referred_id) || []).size;

    return {
      total_referrals: uniqueCount,
      total_commissions: totalCommissions,
      level1_count: level1Count,
      level2_count: level2Count,
      level3_count: level3Count
    };
  }
}