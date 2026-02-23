import api from './api';

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  currency: string;
  isActive: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  autoRecharge?: {
    enabled: boolean;
    threshold: number;
    amount: number;
    paymentMethod: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  _id: string;
  wallet: string;
  user: string;
  type: 'credit' | 'debit' | 'refund' | 'cashback' | 'transfer_in' | 'transfer_out';
  amount: number;
  currency: string;
  balanceAfter: number;
  description: string;
  reference?: string;
  order?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface PaymentMethod {
  _id: string;
  user: string;
  type: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';
  isDefault: boolean;
  isActive: boolean;
  nickname?: string;
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    holderName: string;
  };
  bankDetails?: {
    accountNumberLast4: string;
    bankName: string;
    accountType: 'checking' | 'savings';
  };
  paypalEmail?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AddFundsData {
  amount: number;
  paymentMethodId?: string;
}

export interface AddPaymentMethodData {
  type: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';
  nickname?: string;
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    holderName: string;
  };
  bankDetails?: {
    accountNumberLast4: string;
    bankName: string;
    accountType: 'checking' | 'savings';
  };
  stripePaymentMethodId?: string;
  paypalEmail?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isDefault?: boolean;
}

export interface AutoRechargeSettings {
  enabled: boolean;
  threshold: number;
  amount: number;
  paymentMethod: string;
}

// Get wallet balance and info
export const getWallet = async (): Promise<{
  wallet: Wallet;
  recentTransactions: WalletTransaction[];
}> => {
  const response = await api.get('/wallet');
  return response.data.data;
};

// Add funds to wallet
export const addFunds = async (data: AddFundsData): Promise<{
  wallet: Wallet;
  transaction: WalletTransaction;
}> => {
  const response = await api.post('/wallet/add-funds', data);
  return response.data.data;
};

// Get transaction history
export const getTransactions = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<{
  transactions: WalletTransaction[];
  total: number;
  page: number;
  pages: number;
}> => {
  const response = await api.get('/wallet/transactions', { params });
  return response.data;
};

// Get all payment methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get('/wallet/payment-methods');
  return response.data.data.paymentMethods;
};

// Add payment method
export const addPaymentMethod = async (data: AddPaymentMethodData): Promise<PaymentMethod> => {
  const response = await api.post('/wallet/payment-methods', data);
  return response.data.data.paymentMethod;
};

// Update payment method
export const updatePaymentMethod = async (
  id: string,
  data: Partial<AddPaymentMethodData>
): Promise<PaymentMethod> => {
  const response = await api.patch(`/wallet/payment-methods/${id}`, data);
  return response.data.data.paymentMethod;
};

// Delete payment method
export const deletePaymentMethod = async (id: string): Promise<void> => {
  await api.delete(`/wallet/payment-methods/${id}`);
};

// Set default payment method
export const setDefaultPaymentMethod = async (id: string): Promise<PaymentMethod> => {
  const response = await api.post(`/wallet/payment-methods/${id}/default`);
  return response.data.data.paymentMethod;
};

// Update auto-recharge settings
export const updateAutoRecharge = async (settings: AutoRechargeSettings): Promise<Wallet> => {
  const response = await api.patch('/wallet/auto-recharge', settings);
  return response.data.data.wallet;
};

// Deduct from wallet (for checkout)
export const deductFromWallet = async (amount: number, orderId: string): Promise<{
  success: boolean;
  transaction: WalletTransaction;
  remainingBalance: number;
}> => {
  const response = await api.post('/wallet/deduct', { amount, orderId });
  return response.data.data;
};

export default {
  getWallet,
  addFunds,
  getTransactions,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  updateAutoRecharge,
  deductFromWallet,
};
