import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';
import { BadRequestError } from '../utils/errors';

export class ReviewController {
  public async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const review = await reviewService.submitReview(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Thank you for building trust on CooLink!',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getReviewsForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const reviews = await reviewService.getReviewsForUser(userId);

      res.status(200).json({
        success: true,
        data: { reviews },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
