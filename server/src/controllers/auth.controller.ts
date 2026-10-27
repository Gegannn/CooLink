import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { otpService } from '../services/otp.service';
import { BadRequestError } from '../utils/errors';
import { env } from '../config/env';

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: `Registration successful. OTP has been dispatched to your ${result.otpChannel === 'EMAIL' ? 'email' : 'mobile number'}.`,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          otpChannel: result.otpChannel,
          otpTarget: result.otpTarget,
          debugOtp: result.debugOtp,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, password } = req.body;
      const result = await authService.login(phone, password);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, email, target, channel } = req.body;
      const result = await otpService.generateAndSendOtp({
        phone,
        email,
        channel,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          channel: result.channel,
          target: result.target,
          debugOtp: result.debugOtp,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, email, target, otp } = req.body;
      const identifier = target || email || phone;
      if (!identifier) {
        throw new BadRequestError('Email or phone number is required to verify OTP.');
      }
      const result = await otpService.verifyOtp(identifier, otp);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw new BadRequestError('Refresh token is required.');
      }

      const newTokens = await authService.refreshAccessToken(token);

      res.cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully.',
        data: {
          accessToken: newTokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.userId) {
        await authService.logout(req.user.userId);
      }

      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
