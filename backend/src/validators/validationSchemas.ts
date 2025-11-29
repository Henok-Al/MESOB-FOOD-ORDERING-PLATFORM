import { z } from 'zod';

// ==================== User Validation Schemas ====================

export const registerSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .trim(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .trim(),
    email: z.string()
        .email('Please provide a valid email')
        .toLowerCase()
        .trim(),
    phone: z.string()
        .regex(/^\+?[1-9]\d{9,14}$/, 'Please provide a valid phone number')
        .optional(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
    role: z.enum(['customer', 'restaurant_owner', 'admin', 'driver']).optional(),
});

export const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .trim()
        .optional(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .trim()
        .optional(),
    phone: z.string()
        .regex(/^\+?[1-9]\d{9,14}$/, 'Please provide a valid phone number')
        .optional(),
});

// ==================== Restaurant Validation Schemas ====================

export const createRestaurantSchema = z.object({
    name: z.string()
        .min(1, 'Restaurant name is required')
        .max(100, 'Restaurant name must be less than 100 characters')
        .trim(),
    cuisine: z.string()
        .min(1, 'Cuisine type is required')
        .max(50, 'Cuisine type must be less than 50 characters')
        .trim(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters')
        .trim(),
    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .trim(),
    imageUrl: z.string()
        .url('Please provide a valid URL')
        .optional(),
    deliveryTime: z.string()
        .regex(/^\d+-\d+\s(min|minutes)$/, 'Invalid delivery time format (e.g., "30-45 min")')
        .optional(),
    minOrder: z.number()
        .min(0, 'Minimum order must be at least 0')
        .optional(),
    isActive: z.boolean().optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

// ==================== Product Validation Schemas ====================

export const createProductSchema = z.object({
    name: z.string()
        .min(1, 'Product name is required')
        .max(100, 'Product name must be less than 100 characters')
        .trim(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters')
        .trim(),
    price: z.number()
        .positive('Price must be a positive number')
        .min(0.01, 'Price must be at least 0.01'),
    category: z.string()
        .min(1, 'Category is required')
        .trim(),
    imageUrl: z.string()
        .url('Please provide a valid URL')
        .optional(),
    isAvailable: z.boolean().optional(),
    restaurant: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid restaurant ID')
        .optional(), // Optional because it might come from auth
});

export const updateProductSchema = createProductSchema.partial();

// ==================== Order Validation Schemas ====================

export const createOrderSchema = z.object({
    items: z.array(
        z.object({
            product: z.string()
                .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
            quantity: z.number()
                .int('Quantity must be an integer')
                .positive('Quantity must be positive')
                .min(1, 'Quantity must be at least 1'),
            price: z.number()
                .positive('Price must be positive'),
        })
    ).min(1, 'Order must contain at least one item'),
    restaurant: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid restaurant ID'),
    deliveryAddress: z.string()
        .min(5, 'Delivery address must be at least 5 characters')
        .trim(),
    paymentMethod: z.enum(['cash', 'card', 'mobile_money'], {
        message: 'Invalid payment method'
    }),
    notes: z.string()
        .max(200, 'Notes must be less than 200 characters')
        .trim()
        .optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], {
        message: 'Invalid order status'
    }),
});

// ==================== Type Exports ====================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
