import api from './api';

export interface CreatePaymentIntentParams {
    amount: number;
    currency?: string;
    metadata?: any;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
}

export interface ConfirmPaymentParams {
    paymentIntentId: string;
    orderData: {
        restaurant: string;
        items: Array<{
            product: string;
            name: string;
            quantity: number;
            price: number;
        }>;
        totalAmount: number;
        deliveryAddress: string;
        paymentMethod: string;
    };
}

/**
 * Create a payment intent
 */
export const createPaymentIntent = async (
    params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> => {
    const response = await api.post('/payments/create-intent', params);
    return response.data.data;
};

/**
 * Confirm payment and create order
 */
export const confirmPayment = async (params: ConfirmPaymentParams): Promise<any> => {
    const response = await api.post('/payments/confirm', params);
    return response.data.data.order;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (): Promise<any[]> => {
    const response = await api.get('/payments/history');
    return response.data.data.payments;
};

/**
 * Get payment by order ID
 */
export const getPaymentByOrder = async (orderId: string): Promise<any> => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data.data.payment;
};
