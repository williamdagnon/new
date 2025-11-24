import { Router } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { ApiResponse } from '../types';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Get total users
    const totalUsersResult = await query<{count: number}>(
      'SELECT COUNT(*) as count FROM users WHERE is_admin = FALSE'
    );
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total deposits
    const deposits = await query<{amount: number; status: string}>(
      'SELECT amount, status FROM deposits'
    );

    const totalDeposits = deposits?.reduce((sum: number, d: any) => sum + parseFloat(d.amount.toString()), 0) || 0;
    const pendingDeposits = deposits?.filter((d: any) => d.status === 'pending').length || 0;

    // Get total withdrawals
    const withdrawals = await query<{amount: number; status: string}>(
      'SELECT amount, status FROM withdrawals'
    );

    const totalWithdrawals = withdrawals?.reduce((sum: number, w: any) => sum + parseFloat(w.amount.toString()), 0) || 0;
    const pendingWithdrawals = withdrawals?.filter((w: any) => w.status === 'pending').length || 0;

    // Get total VIP investments
    const investments = await query<{amount: number; status: string}>(
      'SELECT amount, status FROM vip_investments'
    );

    const totalInvestments = investments?.reduce((sum: number, i: any) => sum + parseFloat(i.amount.toString()), 0) || 0;
    const activeInvestments = investments?.filter((i: any) => i.status === 'active').length || 0;

    // Get total commissions paid
    const commissions = await query<{amount: number}>(
      "SELECT amount FROM referral_commissions WHERE status = 'paid'"
    );

    const totalCommissions = commissions?.reduce((sum: number, c: any) => sum + parseFloat(c.amount.toString()), 0) || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDeposits,
        pendingDeposits,
        totalWithdrawals,
        pendingWithdrawals,
        totalInvestments,
        activeInvestments,
        totalCommissions
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get all users
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const users = await query<any>(
      `SELECT u.id, u.phone, u.country_code, u.full_name, u.referral_code, u.is_active, u.created_at,
              w.balance, w.total_invested, w.total_earned
       FROM users u
       LEFT JOIN wallets w ON u.id = w.user_id
       WHERE u.is_admin = FALSE
       ORDER BY u.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      data: users || []
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Manage banks
router.get('/banks', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const banks = await query<any>(
      'SELECT * FROM banks ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: banks || []
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

router.post('/banks', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, code, country_code } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Bank name is required'
      } as ApiResponse);
    }

    const { generateUUID } = await import('../utils/uuid');
    const bankId = generateUUID();

    await query(
      'INSERT INTO banks (id, name, code, country_code, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [bankId, name, code || null, country_code || null]
    );

    const bank = await query<any>(
      'SELECT * FROM banks WHERE id = ?',
      [bankId]
    );

    res.json({
      success: true,
      data: bank[0],
      message: 'Bank created successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get activity logs
router.get('/logs', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await query<any>(
      `SELECT al.*, u.phone as user_phone, u.full_name as user_name, 
              a.phone as admin_phone, a.full_name as admin_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       LEFT JOIN users a ON al.admin_id = a.id
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      data: logs || []
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export default router;