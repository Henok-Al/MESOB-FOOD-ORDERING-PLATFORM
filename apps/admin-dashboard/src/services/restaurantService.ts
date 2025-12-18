import api from './api';
import type { Restaurant } from '@food-ordering/types';

export interface GetRestaurantsResponse {
    status: string;
    data: {
        restaurants: Restaurant[];
    };
}

export interface GetRestaurantResponse {
    status: string;
    data: {
        restaurant: Restaurant;
    };
}

export const restaurantService = {
    // Get all restaurants (admin view)
    getAllRestaurants: async (): Promise<Restaurant[]> => {
        const response = await api.get<GetRestaurantsResponse>('/restaurants/admin/all');
        return response.data.data.restaurants;
    },

    // Get public restaurants
    getRestaurants: async (filters?: {
        cuisine?: string;
        minRating?: number;
        search?: string;
    }): Promise<Restaurant[]> => {
        const params = new URLSearchParams();
        if (filters?.cuisine) params.append('cuisine', filters.cuisine);
        if (filters?.minRating) params.append('minRating', filters.minRating.toString());
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get<GetRestaurantsResponse>(
            `/restaurants?${params.toString()}`
        );
        return response.data.data.restaurants;
    },

    // Get restaurant by ID
    getRestaurantById: async (restaurantId: string): Promise<Restaurant> => {
        const response = await api.get<GetRestaurantResponse>(`/restaurants/${restaurantId}`);
        return response.data.data.restaurant;
    },

    // Create restaurant
    createRestaurant: async (data: Partial<Restaurant>): Promise<Restaurant> => {
        const response = await api.post<GetRestaurantResponse>('/restaurants', data);
        return response.data.data.restaurant;
    },

    // Update restaurant
    updateRestaurant: async (
        restaurantId: string,
        data: Partial<Restaurant>
    ): Promise<Restaurant> => {
        const response = await api.patch<GetRestaurantResponse>(
            `/restaurants/${restaurantId}`,
            data
        );
        return response.data.data.restaurant;
    },

    // Delete restaurant
    deleteRestaurant: async (restaurantId: string): Promise<void> => {
        await api.delete(`/restaurants/${restaurantId}`);
    },

    // Get restaurant menu
    getRestaurantMenu: async (restaurantId: string) => {
        const response = await api.get(`/restaurants/${restaurantId}/products`);
        return response.data.data.products;
    },

    // Create menu item
    createMenuItem: async (restaurantId: string, data: any) => {
        const response = await api.post(`/restaurants/${restaurantId}/products`, data);
        return response.data.data.product;
    },

    // Update menu item
    updateMenuItem: async (restaurantId: string, productId: string, data: any) => {
        const response = await api.patch(
            `/restaurants/${restaurantId}/products/${productId}`,
            data
        );
        return response.data.data.product;
    },

    // Delete menu item
    deleteMenuItem: async (restaurantId: string, productId: string) => {
        await api.delete(`/restaurants/${restaurantId}/products/${productId}`);
    },

    // Get restaurant categories
    getRestaurantCategories: async (restaurantId: string) => {
        const response = await api.get(`/restaurants/${restaurantId}/categories`);
        return response.data.data.categories;
    },
};
