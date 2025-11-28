import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@food-ordering/types';

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    total: number;
    restaurantId: string | null;
}

const initialState: CartState = {
    items: [],
    total: 0,
    restaurantId: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<{ product: Product; restaurantId: string; quantity?: number }>) => {
            const { product, restaurantId, quantity = 1 } = action.payload;

            // Check if adding from a different restaurant
            if (state.restaurantId && state.restaurantId !== restaurantId) {
                // Option: Clear cart or warn user. For now, we'll clear cart.
                state.items = [];
                state.total = 0;
            }
            state.restaurantId = restaurantId;

            const existingItem = state.items.find((item) => item._id === product._id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ ...product, quantity });
            }
            state.total += product.price * quantity;
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const existingItem = state.items.find((item) => item._id === id);
            if (existingItem) {
                if (existingItem.quantity === 1) {
                    state.items = state.items.filter((item) => item._id !== id);
                } else {
                    existingItem.quantity -= 1;
                }
                state.total -= existingItem.price;
            }

            if (state.items.length === 0) {
                state.restaurantId = null;
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.total = 0;
            state.restaurantId = null;
        },
    },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
