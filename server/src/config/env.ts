import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'in-memory',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'coolink_jwt_access_secret_production_ready_key_12345',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'coolink_jwt_refresh_secret_production_ready_key_67890',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'DEV_LOGGER',
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  OTP_CHANNEL: process.env.OTP_CHANNEL || 'EMAIL',
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'DEV_LOGGER',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'CooLink <onboarding@resend.dev>',
  ADMIN_SETUP_KEY: process.env.ADMIN_SETUP_KEY || 'admin_coolink_secure_setup_2026',
};
