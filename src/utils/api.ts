import { ApiResponse, AuthResponse, VIPProduct, VIPInvestment, Deposit, Withdrawal, Bank, Transaction, DailyEarning, ReferralCommission, Wallet } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Auth
  async login(phone: string, password: string, countryCode: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, country_code: countryCode }),
    });
  }

  async signup(data: {
    phone: string;
    password: string;
    full_name: string;
    country_code: string;
    referral_code?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  // VIP
  async getVIPProducts(): Promise<ApiResponse<VIPProduct[]>> {
    return this.request<VIPProduct[]>('/vip/products');
  }

  async purchaseVIP(vipLevel: number, amount: number): Promise<ApiResponse<{ investment: VIPInvestment; wallet: Wallet }>> {
    return this.request('/vip/purchase', {
      method: 'POST',
      body: JSON.stringify({ vip_level: vipLevel, amount }),
    });
  }

  async getVIPInvestments(): Promise<ApiResponse<VIPInvestment[]>> {
    return this.request<VIPInvestment[]>('/vip/investments');
  }

  async getDailyEarnings(limit = 50): Promise<ApiResponse<DailyEarning[]>> {
    return this.request<DailyEarning[]>(`/vip/earnings?limit=${limit}`);
  }

  // Deposits
  async createDeposit(data: {
    amount: number;
    payment_method: string;
    account_number: string;
    transaction_id?: string;
    transfer_id?: string;
    receipt_url?: string;
  }): Promise<ApiResponse<Deposit>> {
    return this.request<Deposit>('/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyDeposits(limit = 50): Promise<ApiResponse<Deposit[]>> {
    return this.request<Deposit[]>(`/deposits/my-deposits?limit=${limit}`);
  }

  // Withdrawals
  async getBanks(): Promise<ApiResponse<Bank[]>> {
    return this.request<Bank[]>('/withdrawals/banks');
  }

  async createWithdrawal(data: {
    amount: number;
    bank_id: string;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
  }): Promise<ApiResponse<Withdrawal>> {
    return this.request<Withdrawal>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyWithdrawals(limit = 50): Promise<ApiResponse<Withdrawal[]>> {
    return this.request<Withdrawal[]>(`/withdrawals/my-withdrawals?limit=${limit}`);
  }

  // Wallet
  async getWallet(): Promise<ApiResponse<Wallet>> {
    return this.request<Wallet>('/wallet');
  }

  async getTransactions(limit = 50): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>(`/wallet/transactions?limit=${limit}`);
  }

  async getReferralStats(): Promise<ApiResponse<any>> {
    return this.request('/wallet/referral-stats');
  }

  async getCommissions(limit = 50): Promise<ApiResponse<ReferralCommission[]>> {
    return this.request<ReferralCommission[]>(`/wallet/commissions?limit=${limit}`);
  }

  async getTeam(): Promise<ApiResponse<any[]>> {
    return this.request('/wallet/team');
  }

  // Admin
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/stats');
  }

  async getAllUsers(limit = 100): Promise<ApiResponse<any[]>> {
    return this.request(`/admin/users?limit=${limit}`);
  }

  async getAllDeposits(status?: string, limit = 100): Promise<ApiResponse<Deposit[]>> {
    const url = status 
      ? `/deposits/all?status=${status}&limit=${limit}`
      : `/deposits/all?limit=${limit}`;
    return this.request<Deposit[]>(url);
  }

  async approveDeposit(depositId: string, notes?: string): Promise<ApiResponse<Deposit>> {
    return this.request<Deposit>(`/deposits/${depositId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectDeposit(depositId: string, notes: string): Promise<ApiResponse<Deposit>> {
    return this.request<Deposit>(`/deposits/${depositId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async getAllWithdrawals(status?: string, limit = 100): Promise<ApiResponse<Withdrawal[]>> {
    const url = status 
      ? `/withdrawals/all?status=${status}&limit=${limit}`
      : `/withdrawals/all?limit=${limit}`;
    return this.request<Withdrawal[]>(url);
  }

  async approveWithdrawal(withdrawalId: string, notes?: string): Promise<ApiResponse<Withdrawal>> {
    return this.request<Withdrawal>(`/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectWithdrawal(withdrawalId: string, notes: string): Promise<ApiResponse<Withdrawal>> {
    return this.request<Withdrawal>(`/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async getBanksAdmin(): Promise<ApiResponse<Bank[]>> {
    return this.request<Bank[]>('/admin/banks');
  }

  async createBank(data: { name: string; code?: string; country_code?: string }): Promise<ApiResponse<Bank>> {
    return this.request<Bank>('/admin/banks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActivityLogs(limit = 100): Promise<ApiResponse<any[]>> {
    return this.request(`/admin/logs?limit=${limit}`);
  }
}

export const api = new ApiClient();
export default api;
