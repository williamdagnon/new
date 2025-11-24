import { Router } from 'express';
import { DepositService } from '../services/deposit.service';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();
const depositService = new DepositService();

// Create deposit request
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { amount, payment_method, account_number, transaction_id, transfer_id, receipt_url } = req.body;

    if (!amount || !payment_method || !account_number) {
      return res.status(400).json({
        success: false,
        error: 'amount, payment_method, and account_number are required'
      } as ApiResponse);
    }

    const deposit = await depositService.createDeposit(userId, {
      amount,
      payment_method,
      account_number,
      transaction_id,
      transfer_id,
      receipt_url
    });

    res.json({
      success: true,
      data: deposit,
      message: 'Deposit request created successfully. Waiting for admin approval.'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get user's deposits
router.get('/my-deposits', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const deposits = await depositService.getUserDeposits(userId, limit);
    
    res.json({
      success: true,
      data: deposits
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Admin: Get all deposits
router.get('/all', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const deposits = await depositService.getAllDeposits(status, limit);
    
    res.json({
      success: true,
      data: deposits
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Admin: Approve deposit
router.post('/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const depositId = req.params.id;
    const adminId = req.user!.id;
    const { notes } = req.body;

    const deposit = await depositService.approveDeposit(depositId, adminId, notes);

    res.json({
      success: true,
      data: deposit,
      message: 'Deposit approved successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Admin: Reject deposit
router.post('/:id/reject', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const depositId = req.params.id;
    const adminId = req.user!.id;
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        error: 'Rejection notes are required'
      } as ApiResponse);
    }

    const deposit = await depositService.rejectDeposit(depositId, adminId, notes);

    res.json({
      success: true,
      data: deposit,
      message: 'Deposit rejected'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export default router;
