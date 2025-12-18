import api from './api';

export interface DashboardData {
    overview: {
        totalUsers?: number;
        totalRestaurants?: number;
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        restaurantName?: string;
    };
    ordersByStatus: Array<{ _id: string; count: number }>;
    dailyRevenue: Array<{ _id: string; revenue: number; orders: number }>;
    topRestaurants?: Array<{ name: string; revenue: number; orders: number }>;
    popularItems?: Array<{ _id: string; totalOrdered: number; revenue: number }>;
}

export interface RestaurantAnalytics {
    overview: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        averageRating: number;
    };
    ordersByStatus: Array<{ _id: string; count: number }>;
    dailyRevenue: Array<{ _id: string; revenue: number; orders: number }>;
    popularItems: Array<{
        productId: string;
        productName: string;
        totalOrdered: number;
        revenue: number;
    }>;
    customerSatisfaction: {
        averageFoodRating: number;
        averageServiceRating: number;
        averageDeliveryRating: number;
        totalReviews: number;
    };
}

export interface RevenueReport {
    totalRevenue: number;
    revenueByRestaurant: Array<{
        restaurantId: string;
        restaurantName: string;
        revenue: number;
        orders: number;
    }>;
    revenueByDate: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    revenueByMonth: Array<{
        month: string;
        revenue: number;
        orders: number;
    }>;
}

export const analyticsService = {
    // Get admin dashboard data
    getAdminDashboard: async (filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<DashboardData> => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await api.get(`/analytics/admin/dashboard?${params.toString()}`);
        return response.data.data;
    },

    // Get restaurant owner dashboard data
    getRestaurantOwnerDashboard: async (filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<DashboardData> => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await api.get(
            `/analytics/restaurant/dashboard?${params.toString()}`
        );
        return response.data.data;
    },

    // Get specific restaurant analytics
    getRestaurantAnalytics: async (
        restaurantId: string,
        filters?: {
            startDate?: string;
            endDate?: string;
        }
    ): Promise<RestaurantAnalytics> => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await api.get(
            `/analytics/restaurant/${restaurantId}?${params.toString()}`
        );
        return response.data.data;
    },

    // Get revenue report
    getRevenueReport: async (filters?: {
        startDate?: string;
        endDate?: string;
        groupBy?: 'day' | 'week' | 'month';
    }): Promise<RevenueReport> => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.groupBy) params.append('groupBy', filters.groupBy);

        const response = await api.get(`/analytics/revenue?${params.toString()}`);
        return response.data.data;
    },
};
