/**
 * Security: File upload validation
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv', 'application/json'];
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

/**
 * Validate file size
 */
export function validateFileSize(size: number): FileValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type by extension
 */
export function validateFileExtension(fileName: string): FileValidationResult {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate file name (prevent path traversal)
 */
export function validateFileName(fileName: string): FileValidationResult {
  // Prevent path traversal attacks
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      valid: false,
      error: 'Invalid file name',
    };
  }

  // Prevent null bytes
  if (fileName.includes('\0')) {
    return {
      valid: false,
      error: 'Invalid file name',
    };
  }

  // Limit length
  if (fileName.length > 255) {
    return {
      valid: false,
      error: 'File name too long',
    };
  }

  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(fileName: string, size: number): FileValidationResult {
  // Validate file name
  const nameValidation = validateFileName(fileName);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  // Validate extension
  const extensionValidation = validateFileExtension(fileName);
  if (!extensionValidation.valid) {
    return extensionValidation;
  }

  // Validate size
  const sizeValidation = validateFileSize(size);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * Sanitize file data before storage
 */
export function sanitizeFileData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeFileData);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    // Remove potentially dangerous keys
    if (key.toLowerCase().includes('__proto__') || key.toLowerCase().includes('constructor')) {
      continue;
    }

    if (typeof value === 'string') {
      // Basic XSS prevention
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else {
      sanitized[key] = sanitizeFileData(value);
    }
  }

  return sanitized;
}

