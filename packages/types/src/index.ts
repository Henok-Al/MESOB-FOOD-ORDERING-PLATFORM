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

// Business hours interface
export interface BusinessHours {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    openTime: string; // Format: "HH:MM" (24-hour)
    closeTime: string; // Format: "HH:MM" (24-hour)
    isClosed: boolean;
}

// Location interface for geospatial data
export interface Location {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

// Social media links interface
export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    twitter?: string;
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

    // Extended fields
    phone?: string;
    email?: string;
    website?: string;
    location?: Location;
    hours?: BusinessHours[];
    gallery?: string[];
    tags?: string[];
    socialMedia?: SocialMedia;
    isFeatured?: boolean;
    viewCount?: number;
    createdAt?: Date;
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
    isVeg?: boolean;
    isFeatured?: boolean;
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

// Restaurant response to review
export interface RestaurantResponse {
    comment: string;
    respondedAt: Date;
}

// Review interface
export interface Review {
    _id?: string;
    id?: string;
    user: User | string;
    restaurant: Restaurant | string;
    order?: Order | string;
    rating: number;
    foodRating?: number;
    serviceRating?: number;
    deliveryRating?: number;
    comment?: string;
    photos?: string[];
    helpfulCount: number;
    isVerified?: boolean;
    restaurantResponse?: RestaurantResponse;
    createdAt: Date;
    updatedAt?: Date;
}

// Restaurant analytics interface
export interface RestaurantAnalytics {
    restaurantId: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    completionRate: number;
    popularItems: {
        productId: string;
        name: string;
        orderCount: number;
        revenue: number;
    }[];
    revenueByPeriod: {
        date: string;
        revenue: number;
        orders: number;
    }[];
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        rating: number;
        count: number;
    }[];
}
