import { Response } from 'express';
import logger from './logger';

/**
 * Handles errors safely by logging details server-side and sending generic messages to clients
 */
export const handleError = (res: Response, error: any, context: string) => {
    // Log detailed error server-side
    logger.error(`[${context}] Error:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
    });

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.errors.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        });
    }

    // Handle known business logic errors
    if (error.message && error.message.includes('not found')) {
        return res.status(404).json({ error: 'Resource not found' });
    }

    // Generic error response - don't expose internal details
    return res.status(500).json({
        error: 'An unexpected error occurred. Please try again later.',
    });
};
