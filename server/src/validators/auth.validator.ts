import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const registerSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters long' }),
  role: z.enum(['WORKER', 'EMPLOYER', 'ADMIN']).default('WORKER'),
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .optional()
    .or(z.literal('')),
  preferredLanguage: z.enum(['en', 'ml']).optional().default('en'),
  adminSetupKey: z.string().optional(),
});

export const loginSchema = z.object({
  phone: z.string().trim().min(1, { message: 'Phone number is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'Please enter a valid 10-digit Indian mobile number' }),
});

export const verifyOtpSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, { message: 'Invalid phone number format' }),
  otp: z.string().trim().length(6, { message: 'OTP must be exactly 6 digits' }),
});
