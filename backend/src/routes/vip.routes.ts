import { Router } from 'express';
import { VIPService } from '../services/vip.service';
import { WalletService } from '../services/wallet.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();
const vipService = new VIPService();
const walletService = new WalletService();

// Get all VIP products
router.get('/products', async (req, res) => {
  try {
    const products = await vipService.getVIPProducts();
    res.json({
      success: true,
      data: products
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Purchase VIP
router.post('/purchase', authenticate, async (req: AuthRequest, res) => {
  try {
    const { vip_level, amount } = req.body;
    const userId = req.user!.id;

    if (!vip_level || !amount) {
      return res.status(400).json({
        success: false,
        error: 'vip_level and amount are required'
      } as ApiResponse);
    }

    const investment = await vipService.purchaseVIP(userId, vip_level, amount);
    const wallet = await walletService.getWallet(userId);

    res.json({
      success: true,
      data: {
        investment,
        wallet
      },
      message: 'VIP investment created successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get user's VIP investments
router.get('/investments', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const investments = await vipService.getUserVIPInvestments(userId);
    
    res.json({
      success: true,
      data: investments
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get daily earnings
router.get('/earnings', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const earnings = await vipService.getDailyEarnings(userId, limit);
    
    res.json({
      success: true,
      data: earnings
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export default router;
