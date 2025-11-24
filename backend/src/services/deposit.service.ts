import { query, queryOne, execute } from '../config/database';
import { Deposit } from '../types';
import { WalletService } from './wallet.service';
import { ReferralService } from './referral.service';
import { PLATFORM_CONFIG } from '../utils/constants';
import { generateUUID } from '../utils/uuid';

export class DepositService {
  private walletService = new WalletService();
  private referralService = new ReferralService();

  async createDeposit(userId: string, data: {
    amount: number;
    payment_method: string;
    account_number: string;
    transaction_id?: string;
    transfer_id?: string;
    receipt_url?: string;
  }): Promise<Deposit> {
    // Validate minimum deposit
    if (data.amount < PLATFORM_CONFIG.minDeposit) {
      throw new Error(`Minimum deposit is ${PLATFORM_CONFIG.minDeposit} FCFA`);
    }

    // Check if this is user's first deposit
    const previousDeposits = await query<{id: string}>(
      `SELECT id FROM deposits 
       WHERE user_id = ? AND status IN ('approved', 'pending')
       LIMIT 1`,
      [userId]
    );

    const isFirstDeposit = !previousDeposits || previousDeposits.length === 0;

    const depositId = generateUUID();

    // Create deposit
    await execute(
      `INSERT INTO deposits 
       (id, user_id, amount, payment_method, account_number, transaction_id, transfer_id, receipt_url, status, is_first_deposit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        depositId,
        userId,
        data.amount,
        data.payment_method,
        data.account_number,
        data.transaction_id || null,
        data.transfer_id || null,
        data.receipt_url || null,
        'pending',
        isFirstDeposit
      ]
    );

    const deposit = await queryOne<Deposit>(
      'SELECT * FROM deposits WHERE id = ?',
      [depositId]
    );

    if (!deposit) {
      throw new Error('Failed to create deposit');
    }

    // Add transaction record
    await this.walletService.addTransaction(
      userId,
      'deposit',
      data.amount,
      `Deposit request - ${data.payment_method}`,
      deposit.id,
      'pending'
    );

    return deposit;
  }

  async approveDeposit(depositId: string, adminId: string, notes?: string): Promise<Deposit> {
    // Get deposit
    const deposit = await queryOne<Deposit>(
      'SELECT * FROM deposits WHERE id = ?',
      [depositId]
    );

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    if (deposit.status !== 'pending') {
      throw new Error(`Deposit is already ${deposit.status}`);
    }

    // Update deposit status
    await execute(
      `UPDATE deposits 
       SET status = 'approved', processed_by = ?, processed_at = NOW(), admin_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [adminId, notes || null, depositId]
    );

    const updatedDeposit = await queryOne<Deposit>(
      'SELECT * FROM deposits WHERE id = ?',
      [depositId]
    );

    if (!updatedDeposit) {
      throw new Error('Failed to approve deposit');
    }

    // Add to wallet balance
    await this.walletService.updateBalance(deposit.user_id, deposit.amount, 'add');

    // Update transaction status
    await execute(
      "UPDATE transactions SET status = 'completed' WHERE reference_id = ? AND type = 'deposit'",
      [depositId]
    );

    // Process referral commissions if this is first deposit
    if (deposit.is_first_deposit) {
      await this.referralService.processReferralCommissions(deposit.user_id, deposit.id, deposit.amount);
    }

    return updatedDeposit;
  }

  async rejectDeposit(depositId: string, adminId: string, notes: string): Promise<Deposit> {
    const deposit = await queryOne<Deposit>(
      'SELECT * FROM deposits WHERE id = ?',
      [depositId]
    );

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    if (deposit.status !== 'pending') {
      throw new Error(`Deposit is already ${deposit.status}`);
    }

    await execute(
      `UPDATE deposits 
       SET status = 'rejected', processed_by = ?, processed_at = NOW(), admin_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [adminId, notes, depositId]
    );

    const updatedDeposit = await queryOne<Deposit>(
      'SELECT * FROM deposits WHERE id = ?',
      [depositId]
    );

    if (!updatedDeposit) {
      throw new Error('Failed to reject deposit');
    }

    // Update transaction status
    await execute(
      "UPDATE transactions SET status = 'rejected' WHERE reference_id = ? AND type = 'deposit'",
      [depositId]
    );

    return updatedDeposit;
  }

  async getUserDeposits(userId: string, limit: number = 50): Promise<Deposit[]> {
    const deposits = await query<Deposit>(
      'SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    return deposits || [];
  }

  async getAllDeposits(status?: string, limit: number = 100): Promise<Deposit[]> {
    let sql = `SELECT d.*, u.id as user_id, u.phone, u.full_name, u.country_code
               FROM deposits d
               LEFT JOIN users u ON d.user_id = u.id
               ORDER BY d.created_at DESC
               LIMIT ?`;
    
    const params: any[] = [limit];
    
    if (status) {
      sql = `SELECT d.*, u.id as user_id, u.phone, u.full_name, u.country_code
             FROM deposits d
             LEFT JOIN users u ON d.user_id = u.id
             WHERE d.status = ?
             ORDER BY d.created_at DESC
             LIMIT ?`;
      params.unshift(status);
    }

    const deposits = await query<Deposit>(sql, params);
    return deposits || [];
  }
}