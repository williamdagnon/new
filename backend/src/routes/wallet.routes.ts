import { Router } from 'express';
import { WalletService } from '../services/wallet.service';
import { ReferralService } from '../services/referral.service';
import { UserService } from '../services/user.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { query } from '../config/database';

const router = Router();
const walletService = new WalletService();
const referralService = new ReferralService();
const userService = new UserService();

// Get wallet
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const wallet = await walletService.getWallet(userId);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: wallet
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get transactions
router.get('/transactions', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const transactions = await query<any>(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    res.json({
      success: true,
      data: transactions || []
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get referral stats
router.get('/referral-stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const stats = await referralService.getReferralStats(userId);
    const user = await userService.getUserById(userId);
    
    res.json({
      success: true,
      data: {
        ...stats,
        referral_code: user?.referral_code
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get referral commissions
router.get('/commissions', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const commissions = await referralService.getUserCommissions(userId, limit);
    
    res.json({
      success: true,
      data: commissions
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get team/referrals
router.get('/team', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const tree = await userService.getReferralTree(userId, 1, 3);
    
    res.json({
      success: true,
      data: tree
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export default router;