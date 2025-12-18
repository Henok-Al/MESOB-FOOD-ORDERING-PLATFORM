import api from './api';
import type { Order } from '@food-ordering/types';
import { OrderStatus } from '@food-ordering/constants';

export interface GetOrdersResponse {
    status: string;
    data: {
        orders: Order[];
    };
}

export interface GetOrderResponse {
    status: string;
    data: {
        order: Order;
    };
}

export const orderService = {
    // Get all orders (admin)
    getAllOrders: async (filters?: {
        status?: OrderStatus;
        restaurantId?: string;
        customerId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Order[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.restaurantId) params.append('restaurantId', filters.restaurantId);
        if (filters?.customerId) params.append('customerId', filters.customerId);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await api.get<GetOrdersResponse>(
            `/orders/admin/all?${params.toString()}`
        );
        return response.data.data.orders;
    },

    // Get my orders (customer/restaurant)
    getMyOrders: async (): Promise<Order[]> => {
        const response = await api.get<GetOrdersResponse>('/orders/myorders');
        return response.data.data.orders;
    },

    // Get order by ID
    getOrderById: async (orderId: string): Promise<Order> => {
        const response = await api.get<GetOrderResponse>(`/orders/${orderId}`);
        return response.data.data.order;
    },

    // Get order tracking
    getOrderTracking: async (orderId: string) => {
        const response = await api.get(`/orders/${orderId}/tracking`);
        return response.data.data;
    },

    // Create order
    createOrder: async (orderData: {
        restaurant: string;
        items: Array<{ product: string; quantity: number; price: number }>;
        deliveryAddress: any;
        paymentMethod: string;
    }): Promise<Order> => {
        const response = await api.post<GetOrderResponse>('/orders', orderData);
        return response.data.data.order;
    },

    // Update order status
    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
        const response = await api.patch<GetOrderResponse>(`/orders/${orderId}/status`, {
            status,
        });
        return response.data.data.order;
    },

    // Cancel order
    cancelOrder: async (orderId: string): Promise<Order> => {
        const response = await api.patch<GetOrderResponse>(`/orders/${orderId}/cancel`);
        return response.data.data.order;
    },

    // Reorder
    reorder: async (orderId: string): Promise<Order> => {
        const response = await api.post<GetOrderResponse>(`/orders/${orderId}/reorder`);
        return response.data.data.order;
    },

    // Get restaurant orders
    getRestaurantOrders: async (restaurantId: string, filters?: {
        status?: OrderStatus;
        startDate?: string;
        endDate?: string;
    }): Promise<Order[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await api.get<GetOrdersResponse>(
            `/orders/restaurant/${restaurantId}?${params.toString()}`
        );
        return response.data.data.orders;
    },
};
