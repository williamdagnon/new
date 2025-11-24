import { Router } from 'express';
import { UserService } from '../services/user.service';
import { generateToken, verifyToken } from '../utils/helpers';
import { ApiResponse, AuthResponse } from '../types';

const router = Router();
const userService = new UserService();

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password, country_code } = req.body;

    if (!phone || !password || !country_code) {
      return res.status(400).json({
        success: false,
        error: 'Phone, password, and country_code are required'
      } as ApiResponse);
    }

    const { user, wallet } = await userService.login({ phone, password, country_code });
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user,
        wallet,
        token
      } as AuthResponse
    } as ApiResponse<AuthResponse>);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { phone, password, full_name, country_code, referral_code } = req.body;

    if (!phone || !password || !full_name || !country_code) {
      return res.status(400).json({
        success: false,
        error: 'Phone, password, full_name, and country_code are required'
      } as ApiResponse);
    }

    const { user, wallet } = await userService.createUser(
      { phone, password, full_name, country_code },
      referral_code
    );

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user,
        wallet,
        token
      } as AuthResponse
    } as ApiResponse<AuthResponse>);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      } as ApiResponse);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const user = await userService.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }
});

export default router;
