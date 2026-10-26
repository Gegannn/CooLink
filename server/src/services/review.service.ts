import { Review, IReview } from '../models/Review';
import { Job } from '../models/Job';
import { WorkRequest } from '../models/WorkRequest';
import { WorkerProfile } from '../models/WorkerProfile';
import { EmployerProfile } from '../models/EmployerProfile';
import { User } from '../models/User';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { Notification } from '../models/Notification';

export class ReviewService {
  public async submitReview(
    reviewerId: string,
    data: {
      jobId: string;
      workRequestId?: string;
      targetUserId: string;
      rating: number;
      comment?: string;
      categoryRatings?: {
        punctuality?: number;
        workQuality?: number;
        paymentPromptness?: number;
      };
    }
  ): Promise<IReview> {
    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      throw new NotFoundError('Reviewer not found.');
    }

    const targetUser = await User.findById(data.targetUserId);
    if (!targetUser) {
      throw new NotFoundError('Target user not found.');
    }

    if (reviewerId === data.targetUserId) {
      throw new BadRequestError('You cannot review yourself.');
    }

    // Verify participant authorization:
    // Either through Job or through WorkRequest
    let isAuthorized = false;

    const job = await Job.findById(data.jobId);
    if (job) {
      if (job.employerId.toString() === reviewerId) {
        // Employer reviewing worker - verify worker was accepted/completed
        const request = await WorkRequest.findOne({
          jobId: job._id,
          workerId: data.targetUserId,
          status: { $in: ['ACCEPTED', 'COMPLETED'] },
        });
        if (request) isAuthorized = true;
      } else if (data.targetUserId === job.employerId.toString()) {
        // Worker reviewing employer
        const request = await WorkRequest.findOne({
          jobId: job._id,
          workerId: reviewerId,
          status: { $in: ['ACCEPTED', 'COMPLETED'] },
        });
        if (request) isAuthorized = true;
      }
    }

    // Direct work request check
    if (!isAuthorized && data.workRequestId) {
      const wr = await WorkRequest.findById(data.workRequestId);
      if (
        wr &&
        (wr.status === 'ACCEPTED' || wr.status === 'COMPLETED') &&
        ((wr.employerId.toString() === reviewerId && wr.workerId.toString() === data.targetUserId) ||
          (wr.workerId.toString() === reviewerId && wr.employerId.toString() === data.targetUserId))
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new ForbiddenError(
        'Only users who directly participated in this completed job assignment are permitted to submit reviews.'
      );
    }

    // Check duplicate
    const existing = await Review.findOne({
      jobId: data.jobId,
      reviewerId,
    });
    if (existing) {
      throw new ConflictError('You have already submitted a review for this job assignment.');
    }

    const review = await Review.create({
      jobId: data.jobId,
      workRequestId: data.workRequestId,
      reviewerId,
      targetUserId: data.targetUserId,
      rating: data.rating,
      comment: data.comment,
      categoryRatings: data.categoryRatings,
    });

    // Recalculate target user average rating
    const allReviews = await Review.find({ targetUserId: data.targetUserId });
    const totalReviews = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviews || 1);
    const roundedAvg = parseFloat(avgRating.toFixed(2));

    if (targetUser.role === 'WORKER') {
      await WorkerProfile.findOneAndUpdate(
        { userId: data.targetUserId },
        {
          $set: {
            averageRating: roundedAvg,
            totalReviews,
          },
        }
      );
    } else {
      await EmployerProfile.findOneAndUpdate(
        { userId: data.targetUserId },
        {
          $set: {
            averageRating: roundedAvg,
            totalReviews,
          },
        }
      );
    }

    // Send notification to target user
    await Notification.create({
      recipientId: data.targetUserId,
      type: 'NEW_REVIEW',
      title: 'New Review Received! / പുതിയ റിവ്യൂ ലഭിച്ചു',
      message: `${reviewer.fullName} gave you a ${data.rating}★ rating: "${data.comment || 'Good work'}"`,
      actionUrl: targetUser.role === 'WORKER' ? `/worker/profile` : `/employer/dashboard`,
    });

    return review;
  }

  public async getReviewsForUser(userId: string) {
    return Review.find({ targetUserId: userId })
      .populate('reviewerId', 'fullName role')
      .populate('jobId', 'title locality')
      .sort({ createdAt: -1 });
  }
}

export const reviewService = new ReviewService();
