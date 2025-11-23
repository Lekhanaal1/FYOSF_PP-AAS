/**
 * Security: Centralized error handling to prevent information leakage
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitize error for client response
 * Never expose internal error details in production
 */
export function sanitizeError(error: unknown): {
  message: string;
  statusCode: number;
  details?: any;
} {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: isDevelopment ? error.stack : undefined,
    };
  }

  if (error instanceof Error) {
    // In production, only show generic messages
    if (!isDevelopment) {
      return {
        message: 'An internal error occurred',
        statusCode: 500,
      };
    }

    // In development, show more details
    return {
      message: error.message,
      statusCode: 500,
      details: error.stack,
    };
  }

  // Unknown error type
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}

/**
 * Safe logging - removes sensitive data
 */
export function safeLogError(context: string, error: unknown): void {
  const sanitized = sanitizeError(error);
  
  // Only log in development or to secure logging service
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, {
      message: sanitized.message,
      statusCode: sanitized.statusCode,
      // Never log full error objects in production
    });
  } else {
    // In production, use structured logging (e.g., Sentry, CloudWatch)
    // This is a placeholder - implement proper logging service
    console.error(`[${context}] Error: ${sanitized.message}`);
  }
}

/**
 * Validate request size
 */
export function validateRequestSize(body: string, maxSize: number = 10 * 1024 * 1024): void {
  const size = Buffer.byteLength(body, 'utf8');
  if (size > maxSize) {
    throw new AppError('Request body too large', 413);
  }
}

