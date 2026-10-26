import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { TokenPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. No access token provided.');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

    if (decoded.status === 'BANNED' || decoded.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account is currently restricted.');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Access token has expired. Please refresh your session.'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token.'));
    } else {
      next(error);
    }
  }
};
