import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';
import { BadRequestError } from '../utils/errors';
import { JobStatus } from '../models/Job';

export class JobController {
  public async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const job = await jobService.createJob(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Job posted successfully. Workers can now discover this opportunity.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { skillId, locality, status, employerId } = req.query;
      const jobs = await jobService.getJobs({
        skillId: skillId as string,
        locality: locality as string,
        status: status as JobStatus,
        employerId: employerId as string,
      });

      res.status(200).json({
        success: true,
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const job = await jobService.getJobById(id);

      res.status(200).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      const { status } = req.body;
      const job = await jobService.updateJobStatus(req.user.userId, id, status);

      res.status(200).json({
        success: true,
        message: `Job status updated to ${status}.`,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
