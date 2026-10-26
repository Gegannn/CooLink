import { Request, Response, NextFunction } from 'express';
import { workerService } from '../services/worker.service';
import { BadRequestError } from '../utils/errors';

export class WorkerController {
  public async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const profile = await workerService.getProfileByUserId(req.user.userId);
      res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const profile = await workerService.updateProfile(req.user.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Worker profile updated successfully.',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const profile = await workerService.updateAvailability(req.user.userId, req.body);
      res.status(200).json({
        success: true,
        message: `Availability updated to ${req.body.status}.`,
        data: {
          availability: profile.availability,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async searchWorkers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        skillId,
        locality,
        minRating,
        minExperience,
        maxWage,
        availableOnly,
        verifiedOnly,
        page,
        limit,
      } = req.query;

      const result = await workerService.searchWorkers({
        skillId: skillId as string,
        locality: locality as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        minExperience: minExperience ? parseInt(minExperience as string, 10) : undefined,
        maxWage: maxWage ? parseFloat(maxWage as string) : undefined,
        availableOnly: availableOnly === 'true',
        verifiedOnly: verifiedOnly === 'true',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getWorkerPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await workerService.getWorkerPublicProfile(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workerController = new WorkerController();
