import { useAuth } from '../context/AuthContext';
import { UserRole } from '@food-ordering/constants';

interface Permission {
    canViewUsers: boolean;
    canManageUsers: boolean;
    canViewAllRestaurants: boolean;
    canManageRestaurant: boolean;
    canViewAllOrders: boolean;
    canManageMenu: boolean;
    canViewAnalytics: boolean;
    isAdmin: boolean;
    isRestaurantOwner: boolean;
    isCustomer: boolean;
    isDriver: boolean;
}

export const usePermission = (): Permission => {
    const { user } = useAuth();

    if (!user) {
        return {
            canViewUsers: false,
            canManageUsers: false,
            canViewAllRestaurants: false,
            canManageRestaurant: false,
            canViewAllOrders: false,
            canManageMenu: false,
            canViewAnalytics: false,
            isAdmin: false,
            isRestaurantOwner: false,
            isCustomer: false,
            isDriver: false,
        };
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isRestaurantOwner = user.role === UserRole.RESTAURANT_OWNER;
    const isCustomer = user.role === UserRole.CUSTOMER;
    const isDriver = user.role === UserRole.DRIVER;

    return {
        // User management - Admin only
        canViewUsers: isAdmin,
        canManageUsers: isAdmin,

        // Restaurant management
        canViewAllRestaurants: isAdmin,
        canManageRestaurant: isAdmin || isRestaurantOwner,

        // Order management
        canViewAllOrders: isAdmin,

        // Menu management
        canManageMenu: isRestaurantOwner || isAdmin,

        // Analytics
        canViewAnalytics: isAdmin || isRestaurantOwner,

        // Role checks
        isAdmin,
        isRestaurantOwner,
        isCustomer,
        isDriver,
    };
};
