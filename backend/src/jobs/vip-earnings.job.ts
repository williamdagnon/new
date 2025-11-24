import cron from 'node-cron';
import { VIPService } from '../services/vip.service';

const vipService = new VIPService();

/**
 * Process VIP daily earnings
 * Runs every minute to check for investments that need earnings
 * This ensures precise 24-hour timing based on purchase time
 */
export const startVIPEarningsJob = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('[VIP Earnings Job] Processing daily earnings...');
      await vipService.processDailyEarnings();
      console.log('[VIP Earnings Job] Completed');
    } catch (error: any) {
      console.error('[VIP Earnings Job] Error:', error.message);
    }
  });

  console.log('[VIP Earnings Job] Started - Running every minute');
};
