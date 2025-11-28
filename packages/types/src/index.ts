import { UserRole } from '@food-ordering/constants';

export interface User {
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
    address: string;
    rating: number;
    imageUrl: string;
    deliveryTime: string;
    minOrder: number;
    isActive: boolean;
    slug?: string;
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
