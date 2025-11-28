import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
    email: z.string()
        .email('Please provide a valid email')
        .min(1, 'Email is required'),
    password: z.string()
        .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
