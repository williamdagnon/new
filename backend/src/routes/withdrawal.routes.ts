import { Router } from 'express';
import { WithdrawalService } from '../services/withdrawal.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();
const withdrawalService = new WithdrawalService();

// Get available banks
router.get('/banks', async (req, res) => {
  try {
    const banks = await withdrawalService.getBanks();
    res.json({
      success: true,
      data: banks
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Create withdrawal request
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { amount, bank_id, bank_name, account_number, account_holder_name } = req.body;

    if (!amount || !bank_id || !bank_name || !account_number || !account_holder_name) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: amount, bank_id, bank_name, account_number, account_holder_name'
      } as ApiResponse);
    }

    const withdrawal = await withdrawalService.createWithdrawal(userId, {
      amount,
      bank_id,
      bank_name,
      account_number,
      account_holder_name
    });

    res.json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal request created. Amount deducted from balance.'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get user's withdrawals
router.get('/my-withdrawals', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const withdrawals = await withdrawalService.getUserWithdrawals(userId, limit);
    
    res.json({
      success: true,
      data: withdrawals
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Admin: Get all withdrawals
router.get('/all', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const withdrawals = await withdrawalService.getAllWithdrawals(status, limit);
    
    res.json({
      success: true,
      data: withdrawals
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Admin: Approve withdrawal
router.post('/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const withdrawalId = req.params.id;
    const adminId = req.user!.id;
    const { notes } = req.body;

    const withdrawal = await withdrawalService.approveWithdrawal(withdrawalId, adminId, notes);

    res.json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal approved successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Admin: Reject withdrawal
router.post('/:id/reject', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const withdrawalId = req.params.id;
    const adminId = req.user!.id;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        error: 'Rejection notes are required'
      } as ApiResponse);
    }

    const withdrawal = await withdrawalService.rejectWithdrawal(withdrawalId, adminId, notes);

    res.json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal rejected. Amount refunded to wallet.'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export default router;
