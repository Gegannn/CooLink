import { Request, Response, NextFunction } from 'express';
import { workRequestService } from '../services/workRequest.service';
import { BadRequestError } from '../utils/errors';
import { WorkRequestStatus } from '../models/WorkRequest';

export class WorkRequestController {
  public async createWorkRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const request = await workRequestService.createWorkRequest(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Work request sent to worker successfully.',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getWorkerRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const status = req.query.status as WorkRequestStatus;
      const requests = await workRequestService.getRequestsForWorker(req.user.userId, status);
      res.status(200).json({
        success: true,
        data: { requests },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getEmployerRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const status = req.query.status as WorkRequestStatus;
      const requests = await workRequestService.getRequestsByEmployer(req.user.userId, status);
      res.status(200).json({
        success: true,
        data: { requests },
      });
    } catch (error) {
      next(error);
    }
  }

  public async acceptWorkRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      const request = await workRequestService.acceptWorkRequest(req.user.userId, id);

      res.status(200).json({
        success: true,
        message: 'Work request accepted! You are now scheduled for this job.',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  }

  public async rejectWorkRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      const { reason } = req.body;
      const request = await workRequestService.rejectWorkRequest(req.user.userId, id, reason);

      res.status(200).json({
        success: true,
        message: 'Work request declined.',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workRequestController = new WorkRequestController();
