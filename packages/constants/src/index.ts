export const APP_NAME = 'Mesob Food Ordering';

export enum UserRole {
    CUSTOMER = 'customer',
    RESTAURANT = 'restaurant',
    DRIVER = 'driver',
    ADMIN = 'admin',
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    READY = 'ready',
    PICKED_UP = 'picked_up',
    ON_THE_WAY = 'on_the_way',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}
