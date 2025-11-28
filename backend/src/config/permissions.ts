// Permission Types
export type Permission =
    | 'restaurant:create'
    | 'restaurant:update'
    | 'restaurant:delete'
    | 'restaurant:view'
    | 'menu:create'
    | 'menu:update'
    | 'menu:delete'
    | 'menu:view'
    | 'order:view'
    | 'order:update_status'
    | 'order:create'
    | 'user:manage'
    | 'user:view';

// Role Definitions
export enum Role {
    CUSTOMER = 'customer',
    RESTAURANT_OWNER = 'restaurant_owner',
    DRIVER = 'driver',
    ADMIN = 'admin',
}

// Role-Permission Mapping
export const rolePermissions: Record<Role, Permission[]> = {
    [Role.CUSTOMER]: [
        'restaurant:view',
        'menu:view',
        'order:create',
        'order:view',
    ],
    [Role.RESTAURANT_OWNER]: [
        'restaurant:view',
        'restaurant:update',
        'menu:create',
        'menu:update',
        'menu:delete',
        'menu:view',
        'order:view',
        'order:update_status',
    ],
    [Role.DRIVER]: [
        'order:view',
        'order:update_status',
    ],
    [Role.ADMIN]: [
        'restaurant:create',
        'restaurant:update',
        'restaurant:delete',
        'restaurant:view',
        'menu:create',
        'menu:update',
        'menu:delete',
        'menu:view',
        'order:view',
        'order:update_status',
        'order:create',
        'user:manage',
        'user:view',
    ],
};

// Helper function to check if a role has a specific permission
export const hasPermission = (role: Role, permission: Permission): boolean => {
    const permissions = rolePermissions[role];
    return permissions.includes(permission);
};

// Helper function to get all permissions for a role
export const getRolePermissions = (role: Role): Permission[] => {
    return rolePermissions[role] || [];
};
