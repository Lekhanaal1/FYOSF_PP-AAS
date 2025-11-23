/**
 * Security: Input validation and sanitization
 */

import { z } from 'zod';

// Validation schemas
export const reportSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  executiveSummary: z.string().min(1).max(5000).trim(),
  background: z.string().min(1).max(10000).trim(),
  evidence: z.string().min(1).max(10000).trim(),
  // PP-AAS Specific Sections
  problemStatement: z.string().min(1).max(10000).trim().optional(),
  ageTokens: z.string().min(1).max(10000).trim().optional(),
  dutyOfCare: z.string().min(1).max(10000).trim().optional(),
  stateModules: z.string().min(1).max(10000).trim().optional(),
  privacyImplementation: z.string().min(1).max(10000).trim().optional(),
  antiFalseSecurity: z.string().min(1).max(10000).trim().optional(),
  equityArchitecture: z.string().min(1).max(10000).trim().optional(),
  securityModel: z.string().min(1).max(10000).trim().optional(),
  governance: z.string().min(1).max(10000).trim().optional(),
  kpis: z.string().min(1).max(10000).trim().optional(),
});

export const userSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).trim().optional(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Sanitization functions
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

