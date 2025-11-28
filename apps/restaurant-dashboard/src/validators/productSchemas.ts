import { z } from 'zod';

// Product validation schema for forms
export const productFormSchema = z.object({
    name: z.string()
        .min(1, 'Product name is required')
        .max(100, 'Product name must be less than 100 characters'),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters'),
    price: z.string()
        .min(1, 'Price is required')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: 'Price must be a positive number',
        }),
    category: z.string()
        .min(1, 'Please select a category'),
    image: z.string()
        .url('Please provide a valid URL')
        .or(z.literal('')),
    isAvailable: z.boolean(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
