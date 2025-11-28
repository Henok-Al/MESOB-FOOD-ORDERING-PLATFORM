import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Middleware to validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param source - Where to validate from ('body', 'params', 'query')
 */
export const validate = (
    schema: z.ZodSchema,
    source: 'body' | 'params' | 'query' = 'body'
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validate the request data
            const validated = await schema.parseAsync(req[source]);

            // Replace the request data with validated data
            req[source] = validated;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format validation errors
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    status: 'fail',
                    message: 'Validation failed',
                    errors,
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error',
                });
            }
        }
    };
};

/**
 * Middleware to validate request body
 * @param schema - Zod schema to validate against
 */
export const validateBody = (schema: z.ZodSchema) => validate(schema, 'body');

/**
 * Middleware to validate request params
 * @param schema - Zod schema to validate against
 */
export const validateParams = (schema: z.ZodSchema) => validate(schema, 'params');

/**
 * Middleware to validate request query
 * @param schema - Zod schema to validate against
 */
export const validateQuery = (schema: z.ZodSchema) => validate(schema, 'query');
