
import { UserRole } from '@food-ordering/constants';

export enum Permission {
    // Restaurant permissions
    CREATE_RESTAURANT = 'create_restaurant',
    UPDATE_RESTAURANT = 'update_restaurant',
    DELETE_RESTAURANT = 'delete_restaurant',
    VIEW_RESTAURANT = 'view_restaurant',
    MANAGE_RESTAURANTS = 'manage_restaurants', // Admin restaurant management

    // Menu permissions
    CREATE_MENU = 'create_menu',
    UPDATE_MENU = 'update_menu',
    DELETE_MENU = 'delete_menu',
    VIEW_MENU = 'view_menu',

    // Order permissions
    VIEW_ORDERS = 'view_orders',
    VIEW_ALL_ORDERS = 'view_all_orders',
    UPDATE_ORDER_STATUS = 'update_order_status',
    CREATE_ORDER = 'create_order',
    MANAGE_ORDERS = 'manage_orders',

    // User permissions
    MANAGE_USERS = 'manage_users',
    MANAGE_DRIVERS = 'manage_drivers',
    
    // Content permissions
    MODERATE_CONTENT = 'moderate_content',
    
    // Coupon permissions
    MANAGE_COUPONS = 'manage_coupons',
}



// Role-Permission Mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.CUSTOMER]: [
        Permission.VIEW_RESTAURANT,
        Permission.VIEW_MENU,
        Permission.CREATE_ORDER,
        Permission.VIEW_ORDERS,
    ],
    [UserRole.RESTAURANT_OWNER]: [
        Permission.VIEW_RESTAURANT,
        Permission.UPDATE_RESTAURANT,
        Permission.CREATE_MENU,
        Permission.UPDATE_MENU,
        Permission.DELETE_MENU,
        Permission.VIEW_MENU,
        Permission.VIEW_ORDERS,
        Permission.UPDATE_ORDER_STATUS,
    ],
    [UserRole.DRIVER]: [
        Permission.VIEW_ORDERS,
        Permission.UPDATE_ORDER_STATUS,
    ],
    [UserRole.ADMIN]: [
        Permission.CREATE_RESTAURANT,
        Permission.UPDATE_RESTAURANT,
        Permission.DELETE_RESTAURANT,
        Permission.VIEW_RESTAURANT,
        Permission.MANAGE_RESTAURANTS,
        Permission.CREATE_MENU,
        Permission.UPDATE_MENU,
        Permission.DELETE_MENU,
        Permission.VIEW_MENU,
        Permission.VIEW_ORDERS,
        Permission.VIEW_ALL_ORDERS,
        Permission.UPDATE_ORDER_STATUS,
        Permission.CREATE_ORDER,
        Permission.MANAGE_ORDERS,
        Permission.MANAGE_USERS,
        Permission.MANAGE_DRIVERS,
        Permission.MODERATE_CONTENT,
        Permission.MANAGE_COUPONS,
    ],
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
    const permissions = rolePermissions[role];
    return permissions.includes(permission);
};

// Helper function to get all permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
    return rolePermissions[role] || [];
};
