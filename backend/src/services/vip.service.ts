import { query, queryOne, execute } from '../config/database';
import { VIPInvestment, VIPProduct, DailyEarning } from '../types';
import { addDays, addHours } from '../utils/helpers';
import { generateUUID } from '../utils/uuid';
import { WalletService } from './wallet.service';

export class VIPService {
  private walletService = new WalletService();

  async getVIPProducts(): Promise<VIPProduct[]> {
    const products = await query<VIPProduct>(
      'SELECT * FROM vip_products WHERE is_active = TRUE ORDER BY level ASC'
    );

    return products || [];
  }

  async getVIPProduct(level: number): Promise<VIPProduct | null> {
    const product = await queryOne<VIPProduct>(
      'SELECT * FROM vip_products WHERE level = ? AND is_active = TRUE',
      [level]
    );

    return product;
  }

  async purchaseVIP(userId: string, vipLevel: number, amount: number): Promise<VIPInvestment> {
    // Get VIP product
    const product = await this.getVIPProduct(vipLevel);
    if (!product) {
      throw new Error('VIP product not found');
    }

    // Validate amount
    if (amount < parseFloat(product.min_amount.toString())) {
      throw new Error(`Minimum amount is ${product.min_amount}`);
    }

    // Check wallet balance
    const wallet = await this.walletService.getWallet(userId);
    if (!wallet || parseFloat(wallet.balance.toString()) < amount) {
      throw new Error('Insufficient balance');
    }

    // Calculate daily return amount
    const dailyReturnAmount = amount * parseFloat(product.daily_return.toString());

    // Get exact purchase time
    const purchaseTime = new Date();
    
    // Calculate next earning time (24 hours from purchase time)
    const nextEarningTime = addHours(purchaseTime, 24);

    // Calculate start and end dates
    const startDate = purchaseTime;
    const endDate = addDays(purchaseTime, product.duration);

    const investmentId = generateUUID();

    // Create VIP investment
    await execute(
      `INSERT INTO vip_investments 
       (id, user_id, vip_level, amount, daily_return_amount, purchase_time, next_earning_time, start_date, end_date, days_elapsed, total_earned, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        investmentId,
        userId,
        vipLevel,
        amount,
        dailyReturnAmount,
        purchaseTime.toISOString().slice(0, 19).replace('T', ' '),
        nextEarningTime.toISOString().slice(0, 19).replace('T', ' '),
        startDate.toISOString().slice(0, 19).replace('T', ' '),
        endDate.toISOString().slice(0, 19).replace('T', ' '),
        0,
        0,
        'active'
      ]
    );

    const investment = await queryOne<VIPInvestment>(
      'SELECT * FROM vip_investments WHERE id = ?',
      [investmentId]
    );

    if (!investment) {
      throw new Error('Failed to create VIP investment');
    }

    // Deduct from wallet
    await this.walletService.updateBalance(userId, amount, 'subtract');
    
    // Update wallet stats
    await this.walletService.updateWalletStats(userId, {
      total_invested: amount
    });

    // Add transaction
    await this.walletService.addTransaction(
      userId,
      'vip_purchase',
      amount,
      `VIP ${product.name} purchase`,
      investment.id,
      'completed'
    );

    return investment;
  }

  async getUserVIPInvestments(userId: string): Promise<VIPInvestment[]> {
    const investments = await query<any>(
      `SELECT vi.*, vp.name, vp.color 
       FROM vip_investments vi
       LEFT JOIN vip_products vp ON vi.vip_level = vp.level
       WHERE vi.user_id = ?
       ORDER BY vi.created_at DESC`,
      [userId]
    );

    return investments || [];
  }

  async processDailyEarnings(): Promise<void> {
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Get all active VIP investments where next_earning_time has passed
    const investments = await query<VIPInvestment>(
      `SELECT * FROM vip_investments 
       WHERE status = 'active' 
       AND next_earning_time <= ? 
       AND end_date >= ?`,
      [nowStr, nowStr]
    );

    if (!investments || investments.length === 0) {
      return;
    }

    for (const investment of investments) {
      // Check if investment is still within duration
      const endDate = new Date(investment.end_date);
      if (endDate < now) {
        // Mark as completed
        await execute(
          "UPDATE vip_investments SET status = 'completed' WHERE id = ?",
          [investment.id]
        );
        continue;
      }

      // Check if we already processed earning for today
      const today = now.toISOString().split('T')[0];
      const existingEarning = await queryOne<DailyEarning>(
        'SELECT id FROM daily_earnings WHERE investment_id = ? AND earning_date = ?',
        [investment.id, today]
      );

      if (existingEarning) {
        // Already processed, just update next_earning_time
        const nextEarning = addHours(now, 24);
        await execute(
          'UPDATE vip_investments SET next_earning_time = ?, updated_at = NOW() WHERE id = ?',
          [nextEarning.toISOString().slice(0, 19).replace('T', ' '), investment.id]
        );
        continue;
      }

      // Create daily earning
      const earningAmount = parseFloat(investment.daily_return_amount.toString());
      const earningId = generateUUID();
      
      await execute(
        `INSERT INTO daily_earnings (id, user_id, investment_id, amount, earning_date, earning_time)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          earningId,
          investment.user_id,
          investment.id,
          earningAmount,
          today,
          nowStr
        ]
      );

      const earning = await queryOne<DailyEarning>(
        'SELECT * FROM daily_earnings WHERE id = ?',
        [earningId]
      );

      if (earning) {
        // Add to wallet balance
        await this.walletService.updateBalance(investment.user_id, earningAmount, 'add');
        
        // Update wallet stats
        await this.walletService.updateWalletStats(investment.user_id, {
          total_earned: earningAmount
        });

        // Add transaction
        await this.walletService.addTransaction(
          investment.user_id,
          'earning',
          earningAmount,
          `Daily VIP earning - Investment #${investment.id.substring(0, 8)}`,
          investment.id,
          'completed'
        );

        // Update investment
        const daysElapsed = investment.days_elapsed + 1;
        const totalEarned = parseFloat(investment.total_earned.toString()) + earningAmount;
        const nextEarning = addHours(now, 24);

        await execute(
          `UPDATE vip_investments 
           SET days_elapsed = ?, total_earned = ?, next_earning_time = ?, updated_at = NOW()
           WHERE id = ?`,
          [
            daysElapsed,
            totalEarned,
            nextEarning.toISOString().slice(0, 19).replace('T', ' '),
            investment.id
          ]
        );
      }
    }
  }

  async getDailyEarnings(userId: string, limit: number = 50): Promise<DailyEarning[]> {
    const earnings = await query<any>(
      `SELECT de.*, vi.vip_level, vp.name, vp.color
       FROM daily_earnings de
       LEFT JOIN vip_investments vi ON de.investment_id = vi.id
       LEFT JOIN vip_products vp ON vi.vip_level = vp.level
       WHERE de.user_id = ?
       ORDER BY de.earning_date DESC
       LIMIT ?`,
      [userId, limit]
    );

    return earnings || [];
  }
}