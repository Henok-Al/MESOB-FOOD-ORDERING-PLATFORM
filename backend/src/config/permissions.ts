
import { UserRole } from '@food-ordering/constants';

export enum Permission {
    // Restaurant permissions
    CREATE_RESTAURANT = 'create_restaurant',
    UPDATE_RESTAURANT = 'update_restaurant',
    DELETE_RESTAURANT = 'delete_restaurant',
    VIEW_RESTAURANT = 'view_restaurant', // Added based on original 'restaurant:view'

    // Menu permissions
    CREATE_MENU = 'create_menu', // Added based on original 'menu:create'
    UPDATE_MENU = 'update_menu', // Added based on original 'menu:update'
    DELETE_MENU = 'delete_menu', // Added based on original 'menu:delete'
    VIEW_MENU = 'view_menu', // Added based on original 'menu:view'

    // Order permissions
    VIEW_ORDERS = 'view_orders',
    UPDATE_ORDER_STATUS = 'update_order_status',
    CREATE_ORDER = 'create_order', // Added based on original 'order:create'
    MANAGE_ORDERS = 'manage_orders', // Admin order management

    // User permissions
    MANAGE_USERS = 'manage_users', // Combines 'user:manage' and 'user:view'
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
        Permission.CREATE_MENU,
        Permission.UPDATE_MENU,
        Permission.DELETE_MENU,
        Permission.VIEW_MENU,
        Permission.VIEW_ORDERS,
        Permission.UPDATE_ORDER_STATUS,
        Permission.CREATE_ORDER,
        Permission.MANAGE_ORDERS,
        Permission.MANAGE_USERS,
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
