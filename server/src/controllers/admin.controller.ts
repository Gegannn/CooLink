import { Request, Response, NextFunction } from 'express';
import { User, UserRole, UserStatus } from '../models/User';
import { WorkerProfile } from '../models/WorkerProfile';
import { Job } from '../models/Job';
import { Report } from '../models/Report';
import { Review } from '../models/Review';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class AdminController {
  public async getAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalWorkers,
        totalEmployers,
        verifiedUsers,
        activeAvailableWorkers,
        jobsPosted,
        jobsCompleted,
        openReports,
        totalReviews,
      ] = await Promise.all([
        User.countDocuments({ role: 'WORKER' }),
        User.countDocuments({ role: 'EMPLOYER' }),
        User.countDocuments({ verificationStatus: 'VERIFIED' }),
        WorkerProfile.countDocuments({ 'availability.status': 'AVAILABLE' }),
        Job.countDocuments(),
        Job.countDocuments({ status: 'COMPLETED' }),
        Report.countDocuments({ status: { $in: ['OPEN', 'INVESTIGATING'] } }),
        Review.countDocuments(),
      ]);

      const avgRatingResult = await Review.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]);
      const platformAverageRating = avgRatingResult.length > 0
        ? parseFloat(avgRatingResult[0].avg.toFixed(2))
        : 4.8;

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalWorkers,
            totalEmployers,
            verifiedUsers,
            activeAvailableWorkers,
            jobsPosted,
            jobsCompleted,
            openReports,
            totalReviews,
            platformAverageRating,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.query.role as UserRole;
      const status = req.query.status as UserStatus;
      const search = req.query.search as string;

      const query: Record<string, unknown> = {};
      if (role) query.role = role;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { fullName: { $regex: new RegExp(search, 'i') } },
          { phone: { $regex: new RegExp(search, 'i') } },
        ];
      }

      const users = await User.find(query).sort({ createdAt: -1 }).limit(50);

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
        throw new BadRequestError('Invalid user status.');
      }

      const user = await User.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User not found.');
      }

      res.status(200).json({
        success: true,
        message: `User status updated to ${status}.`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
