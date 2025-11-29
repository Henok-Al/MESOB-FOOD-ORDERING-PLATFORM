import { UserRole, OrderStatus, RestaurantStatus } from '@food-ordering/constants';

export interface User {
    _id?: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface Restaurant {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    cuisine: string;
    address: string;
    rating: number;
    imageUrl: string;
    deliveryTime: string;
    minOrder: number;
    isActive: boolean;
    status: RestaurantStatus;
    slug?: string;
    owner?: string;
}

export interface Product {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    restaurant: string;
    isAvailable: boolean;
}

export interface OrderItem {
    product: Product | string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    _id?: string;
    id?: string;
    user: User | string;
    restaurant: Restaurant | string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    deliveryAddress: string;
    paymentMethod: 'card' | 'cash';
    paymentStatus: 'pending' | 'paid' | 'failed';
    createdAt: Date;
    updatedAt?: Date;
}
