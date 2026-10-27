import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { OtpVerification } from '../models/OtpVerification';
import { User, IUser } from '../models/User';
import { BadRequestError } from '../utils/errors';

// ==========================================
// SMS Provider Interface & Implementations
// ==========================================
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

      const data = (await response.json()) as { return?: boolean; message?: string };
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

// ==========================================
// Email Provider Interface & Implementations
// ==========================================
export interface IEmailProvider {
  name: string;
  sendOtpEmail(email: string, otp: string, recipientName?: string): Promise<boolean>;
}

export class DevLoggerEmailProvider implements IEmailProvider {
  name = 'DEV_LOGGER';
  async sendOtpEmail(email: string, otp: string, recipientName?: string): Promise<boolean> {
    console.log('\n=========================================');
    console.log(`📧 [EMAIL SERVICE DEV_LOGGER]`);
    console.log(`To: ${recipientName ? `${recipientName} <${email}>` : email}`);
    console.log(`Subject: Your CooLink Verification Code`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: 10 minutes`);
    console.log('=========================================\n');
    return true;
  }
}

function generateOtpHtmlEmail(otp: string, recipientName?: string): string {
  const greeting = recipientName ? `Hello <strong>${recipientName}</strong>,` : 'Hello,';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CooLink Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-size: 26px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
    .tagline { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }
    .otp-box { background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; }
    .expiry { font-size: 13px; color: #64748b; margin-top: 10px; font-weight: 600; }
    .notice { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px; }
    .security-tip { background: #f8fafc; border-radius: 12px; padding: 14px; font-size: 12px; color: #64748b; border: 1px solid #f1f5f9; margin-top: 24px; }
    .footer { border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 28px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">CooLink</div>
      <div class="tagline">Daily-Wage Worker Marketplace</div>
    </div>
    <p style="margin: 0 0 16px 0; font-size: 15px;">${greeting}</p>
    <p class="notice">Thank you for registering on CooLink. Use the 6-digit verification code below to verify your account:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="expiry">Valid for 10 minutes</div>
    </div>
    <div class="security-tip">
      🔒 <strong>Security Tip:</strong> Never share this code with anyone. CooLink staff will never ask for your verification code.
    </div>
    <div class="footer">
      &copy; 2026 CooLink Marketplace &bull; Kerala, India
    </div>
  </div>
</body>
</html>
  `;
}

export class ResendEmailProvider implements IEmailProvider {
  name = 'RESEND';
  async sendOtpEmail(email: string, otp: string, recipientName?: string): Promise<boolean> {
    if (!env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not configured. Falling back to dev logger.');
      return new DevLoggerEmailProvider().sendOtpEmail(email, otp, recipientName);
    }
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM || 'CooLink <onboarding@resend.dev>',
          to: email,
          subject: `${otp} is your CooLink verification code`,
          html: generateOtpHtmlEmail(otp, recipientName),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Resend delivery error:', errText);
        return false;
      }
      console.log(`[Resend] Dispatched OTP email to ${email} successfully`);
      return true;
    } catch (err) {
      console.error('Error calling Resend API:', err);
      return false;
    }
  }
}

export class BrevoEmailProvider implements IEmailProvider {
  name = 'BREVO';
  async sendOtpEmail(email: string, otp: string, recipientName?: string): Promise<boolean> {
    if (!env.BREVO_API_KEY) {
      console.warn('BREVO_API_KEY is not configured. Falling back to dev logger.');
      return new DevLoggerEmailProvider().sendOtpEmail(email, otp, recipientName);
    }
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'CooLink', email: 'no-reply@coolink.in' },
          to: [{ email, name: recipientName || 'User' }],
          subject: `${otp} is your CooLink verification code`,
          htmlContent: generateOtpHtmlEmail(otp, recipientName),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Brevo delivery error:', errText);
        return false;
      }
      console.log(`[Brevo] Dispatched OTP email to ${email} successfully`);
      return true;
    } catch (err) {
      console.error('Error calling Brevo API:', err);
      return false;
    }
  }
}

// ==========================================
// Central OTP Service
// ==========================================
export interface SendOtpOptions {
  email?: string;
  phone?: string;
  recipientName?: string;
  channel?: 'EMAIL' | 'SMS';
}

export class OtpService {
  private smsProvider: ISmsProvider;
  private emailProvider: IEmailProvider;

  constructor() {
    // SMS provider setup
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

    // Email provider setup
    switch (env.EMAIL_PROVIDER.toUpperCase()) {
      case 'RESEND':
        this.emailProvider = new ResendEmailProvider();
        break;
      case 'BREVO':
        this.emailProvider = new BrevoEmailProvider();
        break;
      default:
        this.emailProvider = new DevLoggerEmailProvider();
        break;
    }
  }

  public setSmsProvider(provider: ISmsProvider): void {
    this.smsProvider = provider;
  }

  public setEmailProvider(provider: IEmailProvider): void {
    this.emailProvider = provider;
  }

  private generate6DigitOtp(): string {
    return Math.floor(100000 + crypto.randomInt(900000)).toString();
  }

  public async generateAndSendOtp(
    targetOrOptions: string | SendOtpOptions
  ): Promise<{ success: boolean; message: string; channel: 'EMAIL' | 'SMS'; target: string; debugOtp?: string }> {
    let target = '';
    let channel: 'EMAIL' | 'SMS' = 'EMAIL';
    let email: string | undefined;
    let phone: string | undefined;
    let recipientName: string | undefined;

    if (typeof targetOrOptions === 'string') {
      const clean = targetOrOptions.trim();
      if (clean.includes('@')) {
        target = clean.toLowerCase();
        email = target;
        channel = 'EMAIL';
      } else {
        target = clean;
        phone = target;
        channel = 'SMS';
      }
    } else {
      recipientName = targetOrOptions.recipientName;
      email = targetOrOptions.email?.trim().toLowerCase();
      phone = targetOrOptions.phone?.trim();

      if (targetOrOptions.channel) {
        channel = targetOrOptions.channel;
      } else if (email) {
        channel = 'EMAIL';
      } else if (phone) {
        channel = 'SMS';
      } else {
        channel = env.OTP_CHANNEL.toUpperCase() === 'SMS' ? 'SMS' : 'EMAIL';
      }

      if (channel === 'EMAIL') {
        if (!email) {
          throw new BadRequestError('Email address is required for email verification.');
        }
        target = email;
      } else {
        if (!phone) {
          throw new BadRequestError('Phone number is required for SMS verification.');
        }
        target = phone;
      }
    }

    // Rate limit check: count OTPs created in last 10 minutes for this target
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequests = await OtpVerification.countDocuments({
      target,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentRequests >= 5) {
      throw new BadRequestError('Too many OTP requests. Please wait a few minutes before trying again.');
    }

    const plainOtp = this.generate6DigitOtp();
    const otpHash = await bcrypt.hash(plainOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing active OTPs for this target
    const deleteQueries: Array<Record<string, unknown>> = [{ target }];
    if (phone) deleteQueries.push({ phone });
    if (email) deleteQueries.push({ email });

    await OtpVerification.deleteMany({ $or: deleteQueries });

    // Store new verification record
    await OtpVerification.create({
      target,
      type: channel,
      phone: phone || (channel === 'SMS' ? target : undefined),
      email: email || (channel === 'EMAIL' ? target : undefined),
      otpHash,
      attempts: 0,
      maxAttempts: 3,
      expiresAt,
      verified: false,
    });

    // Send via active Provider
    if (channel === 'EMAIL') {
      await this.emailProvider.sendOtpEmail(target, plainOtp, recipientName);
    } else {
      await this.smsProvider.sendOtp(target, plainOtp);
    }

    return {
      success: true,
      channel,
      target,
      message: `OTP sent successfully to ${target}`,
      debugOtp: env.NODE_ENV !== 'production' ? plainOtp : undefined,
    };
  }

  public async verifyOtp(
    targetOrPhone: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanTarget = targetOrPhone.trim();
    const cleanOtp = otp.trim();

    // Query active unverified OTP by target, phone, or email
    const record = await OtpVerification.findOne({
      $or: [
        { target: cleanTarget },
        { target: cleanTarget.toLowerCase() },
        { phone: cleanTarget },
        { email: cleanTarget.toLowerCase() },
      ],
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

    // Mark user email and phone as verified in DB
    const userUpdateConditions: Array<Record<string, unknown>> = [];
    if (record.email) userUpdateConditions.push({ email: record.email.toLowerCase() });
    if (record.phone) userUpdateConditions.push({ phone: record.phone });
    if (record.target) {
      userUpdateConditions.push({ phone: record.target });
      userUpdateConditions.push({ email: record.target.toLowerCase() });
    }

    await User.updateMany(
      { $or: userUpdateConditions },
      {
        $set: {
          isEmailVerified: true,
          isPhoneVerified: true,
        },
      }
    );

    return {
      success: true,
      message: 'Account verified successfully.',
    };
  }
}

export const otpService = new OtpService();
