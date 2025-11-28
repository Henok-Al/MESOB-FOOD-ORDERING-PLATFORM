import { z } from 'zod';

// Registration validation schema
export const registerSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters'),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters'),
    email: z.string()
        .email('Invalid email address')
        .min(1, 'Email is required'),
    phone: z.string()
        .regex(/^[0-9]+$/, 'Must be only digits')
        .min(10, 'Must be at least 10 digits')
        .optional()
        .or(z.literal('')),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
        .min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
});

// Login validation schema
export const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email')
        .min(1, 'Email is required'),
    password: z.string()
        .min(1, 'Password is required'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
