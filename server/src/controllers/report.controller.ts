import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { BadRequestError } from '../utils/errors';
import { ReportStatus } from '../models/Report';

export class ReportController {
  public async submitReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const report = await reportService.submitReport(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Report submitted. Our trust & safety team will review the case promptly.',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  public async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { targetUserId } = req.body;
      await reportService.blockUser(req.user.userId, targetUserId);

      res.status(200).json({
        success: true,
        message: 'User blocked successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as ReportStatus;
      const reports = await reportService.getReports(status);

      res.status(200).json({
        success: true,
        data: { reports },
      });
    } catch (error) {
      next(error);
    }
  }

  public async resolveReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      const report = await reportService.resolveReport(req.user.userId, id, req.body);

      res.status(200).json({
        success: true,
        message: 'Report status updated.',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getSuspiciousSignals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const signals = await reportService.detectSuspiciousSignals(userId);

      res.status(200).json({
        success: true,
        data: { signals },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
