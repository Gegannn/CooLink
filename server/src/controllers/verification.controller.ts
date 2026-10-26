import { Request, Response, NextFunction } from 'express';
import { verificationService } from '../services/verification.service';
import { BadRequestError } from '../utils/errors';

export class VerificationController {
  public async submitVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const request = await verificationService.submitVerification(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Government ID submitted for verification. Admin team will review within 24 hours.',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getPendingVerifications(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await verificationService.getPendingVerifications();
      res.status(200).json({
        success: true,
        data: { requests },
      });
    } catch (error) {
      next(error);
    }
  }

  public async reviewVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      const { decision, rejectionReason } = req.body;
      const request = await verificationService.reviewVerification(
        req.user.userId,
        id,
        decision,
        rejectionReason
      );

      res.status(200).json({
        success: true,
        message: `Verification request ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}.`,
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const verificationController = new VerificationController();
