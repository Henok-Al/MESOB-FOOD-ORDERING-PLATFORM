import api from './api';
import type { User } from '@food-ordering/types';

export interface GetUsersResponse {
    status: string;
    data: {
        users: User[];
    };
}

export interface GetUserResponse {
    status: string;
    data: {
        user: User;
    };
}

export const userService = {
    // Get all users
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<GetUsersResponse>('/users');
        return response.data.data.users;
    },

    // Get user by ID
    getUserById: async (userId: string): Promise<User> => {
        const response = await api.get<GetUserResponse>(`/users/${userId}`);
        return response.data.data.user;
    },

    // Update user
    updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
        const response = await api.patch<GetUserResponse>(`/users/${userId}`, data);
        return response.data.data.user;
    },

    // Delete user
    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/users/${userId}`);
    },

    // Get user statistics
    getUserStats: async () => {
        const response = await api.get('/analytics/admin/user-stats');
        return response.data.data;
    },
};
