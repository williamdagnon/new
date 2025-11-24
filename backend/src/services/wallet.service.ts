import { query, queryOne, execute } from '../config/database';
import { Wallet, Transaction } from '../types';
import { generateUUID } from '../utils/uuid';

export class WalletService {
  async getWallet(userId: string): Promise<Wallet | null> {
    const wallet = await queryOne<Wallet>(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    );

    return wallet;
  }

  async updateBalance(userId: string, amount: number, type: 'add' | 'subtract'): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const currentBalance = parseFloat(wallet.balance.toString());
    const newBalance = type === 'add' 
      ? currentBalance + amount
      : currentBalance - amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }

    await execute(
      'UPDATE wallets SET balance = ?, updated_at = NOW() WHERE user_id = ?',
      [newBalance, userId]
    );

    const updatedWallet = await this.getWallet(userId);
    if (!updatedWallet) {
      throw new Error('Failed to update wallet');
    }

    return updatedWallet;
  }

  async addTransaction(
    userId: string,
    type: Transaction['type'],
    amount: number,
    description?: string,
    referenceId?: string,
    status: Transaction['status'] = 'completed'
  ): Promise<Transaction> {
    const transactionId = generateUUID();

    await execute(
      `INSERT INTO transactions (id, user_id, type, amount, description, reference_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, userId, type, amount, description, referenceId, status]
    );

    const transaction = await queryOne<Transaction>(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (!transaction) {
      throw new Error('Failed to create transaction');
    }

    return transaction;
  }

  async updateWalletStats(
    userId: string,
    updates: {
      total_invested?: number;
      total_earned?: number;
      total_withdrawn?: number;
    }
  ): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.total_invested !== undefined) {
      const newValue = parseFloat(wallet.total_invested.toString()) + updates.total_invested;
      updateFields.push('total_invested = ?');
      updateValues.push(newValue);
    }
    if (updates.total_earned !== undefined) {
      const newValue = parseFloat(wallet.total_earned.toString()) + updates.total_earned;
      updateFields.push('total_earned = ?');
      updateValues.push(newValue);
    }
    if (updates.total_withdrawn !== undefined) {
      const newValue = parseFloat(wallet.total_withdrawn.toString()) + updates.total_withdrawn;
      updateFields.push('total_withdrawn = ?');
      updateValues.push(newValue);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      updateValues.push(userId);

      await execute(
        `UPDATE wallets SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateValues
      );
    }

    const updatedWallet = await this.getWallet(userId);
    if (!updatedWallet) {
      throw new Error('Failed to update wallet stats');
    }

    return updatedWallet;
  }
}