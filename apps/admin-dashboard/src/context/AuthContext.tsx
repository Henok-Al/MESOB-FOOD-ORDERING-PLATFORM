import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import type { User } from '@food-ordering/types';
import { UserRole } from '@food-ordering/constants';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await api.get('/auth/me');
            const userData = response.data.data;
            setUser({
                ...userData,
                id: userData._id || userData.id,
            });
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        const { token, data } = response.data;
        
        const user = {
            ...data,
            id: data._id || data.id,
        };

        if (user.role !== UserRole.ADMIN && user.role !== UserRole.RESTAURANT_OWNER) {
            throw new Error('Access denied. Admin or Restaurant Owner privileges required.');
        }

        localStorage.setItem('token', token);
        setUser(user);
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
