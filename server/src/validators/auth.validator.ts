import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const registerSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters long' }),
  role: z.enum(['WORKER', 'EMPLOYER', 'ADMIN']).default('WORKER'),
  preferredLanguage: z.enum(['en', 'ml']).optional().default('en'),
  adminSetupKey: z.string().optional(),
});

export const loginSchema = z.object({
  phone: z.string().trim().min(1, { message: 'Phone number is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const sendOtpSchema = z
  .object({
    email: z.string().trim().email().optional().or(z.literal('')),
    phone: z.string().trim().regex(phoneRegex, { message: 'Please enter a valid 10-digit Indian mobile number' }).optional().or(z.literal('')),
    target: z.string().trim().optional(),
    channel: z.enum(['EMAIL', 'SMS']).optional(),
  })
  .refine((data) => data.email || data.phone || data.target, {
    message: 'Either email or phone number is required to send OTP',
  });

export const verifyOtpSchema = z
  .object({
    email: z.string().trim().email().optional().or(z.literal('')),
    phone: z.string().trim().regex(phoneRegex, { message: 'Invalid phone number format' }).optional().or(z.literal('')),
    target: z.string().trim().optional(),
    otp: z.string().trim().length(6, { message: 'OTP must be exactly 6 digits' }),
  })
  .refine((data) => data.email || data.phone || data.target, {
    message: 'Email or phone number is required to verify OTP',
  });
