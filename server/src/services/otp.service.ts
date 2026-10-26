import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { OtpVerification } from '../models/OtpVerification';
import { User } from '../models/User';
import { BadRequestError } from '../utils/errors';

export interface ISmsProvider {
  name: string;
  sendOtp(phone: string, otp: string): Promise<boolean>;
}

export class DevLoggerSmsProvider implements ISmsProvider {
  name = 'DEV_LOGGER';
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    console.log('\n=========================================');
    console.log(`📱 [SMS SERVICE DEV_LOGGER]`);
    console.log(`To: ${phone}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: 10 minutes`);
    console.log('=========================================\n');
    return true;
  }
}

export class Fast2SmsProvider implements ISmsProvider {
  name = 'FAST2SMS';
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    if (!env.FAST2SMS_API_KEY) {
      console.warn('FAST2SMS_API_KEY is not configured. Falling back to dev logger.');
      return new DevLoggerSmsProvider().sendOtp(phone, otp);
    }
    try {
      // Real Fast2SMS Quick Transactional OTP API call
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: phone,
        }),
      });

      const data = await response.json() as { return?: boolean; message?: string };
      if (!response.ok || !data.return) {
        console.error('Fast2SMS delivery error:', data);
        return false;
      }
      console.log(`[Fast2SMS] Dispatched OTP to ${phone} successfully`);
      return true;
    } catch (err) {
      console.error('Error calling Fast2SMS API:', err);
      return false;
    }
  }
}

export class TwilioSmsProvider implements ISmsProvider {
  name = 'TWILIO';
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio credentials not configured. Falling back to dev logger.');
      return new DevLoggerSmsProvider().sendOtp(phone, otp);
    }
    try {
      const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const targetPhone = phone.startsWith('+') ? phone : `+91${phone}`;

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: targetPhone,
            From: env.TWILIO_PHONE_NUMBER,
            Body: `Your CooLink verification OTP code is ${otp}. Valid for 10 minutes.`,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('Twilio delivery error:', errText);
        return false;
      }
      console.log(`[Twilio] Dispatched SMS to ${targetPhone} successfully`);
      return true;
    } catch (err) {
      console.error('Error calling Twilio API:', err);
      return false;
    }
  }
}

export class OtpService {
  private smsProvider: ISmsProvider;

  constructor() {
    switch (env.SMS_PROVIDER.toUpperCase()) {
      case 'FAST2SMS':
        this.smsProvider = new Fast2SmsProvider();
        break;
      case 'TWILIO':
        this.smsProvider = new TwilioSmsProvider();
        break;
      default:
        this.smsProvider = new DevLoggerSmsProvider();
        break;
    }
  }

  public setSmsProvider(provider: ISmsProvider): void {
    this.smsProvider = provider;
  }

  private generate6DigitOtp(): string {
    return Math.floor(100000 + crypto.randomInt(900000)).toString();
  }

  public async generateAndSendOtp(phone: string): Promise<{ success: boolean; message: string; debugOtp?: string }> {
    const cleanPhone = phone.trim();

    // Check rate limit: count OTPs created in last 10 minutes for this phone
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequests = await OtpVerification.countDocuments({
      phone: cleanPhone,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentRequests >= 4) {
      throw new BadRequestError('Too many OTP requests. Please wait a few minutes before trying again.');
    }

    const plainOtp = this.generate6DigitOtp();
    const otpHash = await bcrypt.hash(plainOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing active OTPs for this phone
    await OtpVerification.deleteMany({ phone: cleanPhone });

    // Store new verification record
    await OtpVerification.create({
      phone: cleanPhone,
      otpHash,
      attempts: 0,
      maxAttempts: 3,
      expiresAt,
      verified: false,
    });

    // Send via active SMS Provider
    await this.smsProvider.sendOtp(cleanPhone, plainOtp);

    return {
      success: true,
      message: `OTP sent to ${cleanPhone}`,
      // Return debugOtp only in development/test environment for easy testing
      debugOtp: env.NODE_ENV !== 'production' ? plainOtp : undefined,
    };
  }

  public async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();

    const record = await OtpVerification.findOne({
      phone: cleanPhone,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new BadRequestError('OTP has expired or was not requested. Please request a new OTP.');
    }

    if (record.attempts >= record.maxAttempts) {
      await OtpVerification.deleteOne({ _id: record._id });
      throw new BadRequestError('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      const remaining = record.maxAttempts - record.attempts;
      throw new BadRequestError(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt(s) remaining.`
          : 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.'
      );
    }

    record.verified = true;
    await record.save();

    // Mark user phone as verified if user already exists
    await User.updateOne({ phone: cleanPhone }, { $set: { isPhoneVerified: true } });

    return {
      success: true,
      message: 'Phone number verified successfully.',
    };
  }
}

export const otpService = new OtpService();
