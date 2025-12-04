import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@food-ordering/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
        setAuthenticatedUser: (state, action: PayloadAction<{ user: User; token?: string }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            if (action.payload.token) {
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            } else if (!state.token) {
                state.token = localStorage.getItem('token');
            }
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setAuthenticatedUser } = authSlice.actions;
export default authSlice.reducer;
