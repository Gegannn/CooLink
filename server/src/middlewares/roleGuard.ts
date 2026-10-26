import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../models/User';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

export const requirePhoneVerified = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required.'));
  }

  if (!req.user.isPhoneVerified) {
    return next(new ForbiddenError('Phone verification is required to perform this action.'));
  }

  next();
};
