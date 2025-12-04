import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout, setAuthenticatedUser } from '../store/slices/authSlice';
import api from '../services/api';

export const useAuth = (options: { redirectToLogin?: boolean } = {}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');
                
                // If no token, user is not authenticated
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                // Set token in axios headers
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Verify token with backend
                const { data } = await api.get('/auth/me');
                if (data?.data) {
                    dispatch(setAuthenticatedUser({ user: data.data }));
                }
                
                // If we get here, user is authenticated
                setIsLoading(false);
            } catch (error) {
                // Token is invalid, logout user
                console.error('Auth check failed:', error);
                dispatch(logout());
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [dispatch]);

    useEffect(() => {
        if (!options.redirectToLogin) return;
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate, options.redirectToLogin]);

    return { isAuthenticated, isLoading };
};