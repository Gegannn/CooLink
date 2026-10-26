import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUser, User } from '../models/User';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { otpService } from './otp.service';

export interface TokenPayload {
  userId: string;
  role: string;
  isPhoneVerified: boolean;
  status: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  public generateTokens(user: IUser): AuthTokens {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      isPhoneVerified: user.isPhoneVerified,
      status: user.status,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  public async register(data: {
    phone: string;
    password: string;
    fullName: string;
    role: 'WORKER' | 'EMPLOYER' | 'ADMIN';
    email?: string;
    preferredLanguage?: 'en' | 'ml';
    adminSetupKey?: string;
  }): Promise<{ user: Partial<IUser>; tokens: AuthTokens; otpSent: boolean; debugOtp?: string }> {
    const existing = await User.findOne({ phone: data.phone });
    if (existing) {
      throw new ConflictError('A user with this mobile number already exists.');
    }

    if (data.role === 'ADMIN') {
      if (!data.adminSetupKey || data.adminSetupKey !== env.ADMIN_SETUP_KEY) {
        throw new ForbiddenError('Invalid Admin setup key. Admin registration rejected.');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = await User.create({
      phone: data.phone,
      email: data.email || undefined,
      passwordHash,
      fullName: data.fullName,
      role: data.role,
      preferredLanguage: data.preferredLanguage || 'en',
      isPhoneVerified: false,
      verificationStatus: 'NOT_VERIFIED',
      status: 'ACTIVE',
    });

    // Generate tokens
    const tokens = this.generateTokens(newUser);
    newUser.refreshToken = tokens.refreshToken;
    await newUser.save();

    // Trigger OTP dispatch automatically upon registration
    let debugOtp: string | undefined;
    try {
      const otpRes = await otpService.generateAndSendOtp(newUser.phone);
      debugOtp = otpRes.debugOtp;
    } catch (err) {
      console.warn('Failed to dispatch initial OTP during registration:', err);
    }

    const userObj = newUser.toObject();
    delete (userObj as unknown as Record<string, unknown>).passwordHash;
    delete (userObj as unknown as Record<string, unknown>).refreshToken;

    return {
      user: userObj,
      tokens,
      otpSent: true,
      debugOtp,
    };
  }

  public async login(
    phone: string,
    password: string
  ): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    const user = await User.findOne({ phone }).select('+passwordHash +refreshToken');
    if (!user) {
      throw new UnauthorizedError('Invalid mobile number or password.');
    }

    if (user.status === 'BANNED') {
      throw new ForbiddenError('Your account has been banned due to policy violations. Contact support.');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account is temporarily suspended. Contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid mobile number or password.');
    }

    // Generate fresh tokens and rotate refresh token
    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userObj = user.toObject();
    delete (userObj as unknown as Record<string, unknown>).passwordHash;
    delete (userObj as unknown as Record<string, unknown>).refreshToken;

    return {
      user: userObj,
      tokens,
    };
  }

  public async refreshAccessToken(providedRefreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(providedRefreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
      const user = await User.findById(decoded.userId).select('+refreshToken');

      if (!user || user.refreshToken !== providedRefreshToken) {
        throw new UnauthorizedError('Invalid or expired refresh token. Please sign in again.');
      }

      if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
        throw new ForbiddenError('Account is not active.');
      }

      // Rotate tokens
      const newTokens = this.generateTokens(user);
      user.refreshToken = newTokens.refreshToken;
      await user.save();

      return newTokens;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  public async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  public async getCurrentUser(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return user.toObject();
  }
}

export const authService = new AuthService();
