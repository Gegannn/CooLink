import { Job, IJob, JobStatus } from '../models/Job';
import { WorkerProfile } from '../models/WorkerProfile';
import { WorkRequest } from '../models/WorkRequest';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { Notification } from '../models/Notification';

export class JobService {
  public async createJob(
    employerId: string,
    data: {
      title: string;
      description: string;
      requiredSkillId: string;
      workersNeeded?: number;
      wageOffer: number;
      wageType?: 'DAILY' | 'HOURLY' | 'FIXED';
      startDate: string | Date;
      durationDays?: number;
      startTime?: string;
      locality: string;
      district?: string;
      landmark?: string;
      location?: [number, number];
    }
  ): Promise<IJob> {
    const job = await Job.create({
      employerId,
      title: data.title,
      description: data.description,
      requiredSkillId: data.requiredSkillId,
      workersNeeded: data.workersNeeded || 1,
      workersHired: 0,
      wageOffer: data.wageOffer,
      wageType: data.wageType || 'DAILY',
      startDate: new Date(data.startDate),
      durationDays: data.durationDays || 1,
      startTime: data.startTime || '08:00 AM',
      locality: data.locality,
      district: data.district || 'Malappuram',
      landmark: data.landmark,
      location: {
        type: 'Point',
        coordinates: data.location || [75.9938, 10.9987],
      },
      status: 'POSTED',
      paymentStatus: 'PENDING',
    });

    return job;
  }

  public async getJobs(filters: {
    skillId?: string;
    locality?: string;
    status?: JobStatus;
    employerId?: string;
  }): Promise<IJob[]> {
    const query: Record<string, unknown> = {};

    if (filters.skillId) query.requiredSkillId = filters.skillId;
    if (filters.locality) query.locality = { $regex: new RegExp(filters.locality, 'i') };
    if (filters.status) query.status = filters.status;
    if (filters.employerId) query.employerId = filters.employerId;

    return Job.find(query)
      .populate('requiredSkillId')
      .populate('employerId', 'fullName phone isPhoneVerified')
      .sort({ startDate: 1, createdAt: -1 });
  }

  public async getJobById(jobId: string): Promise<IJob> {
    const job = await Job.findById(jobId)
      .populate('requiredSkillId')
      .populate('employerId', 'fullName phone isPhoneVerified');

    if (!job) {
      throw new NotFoundError('Job posting not found.');
    }

    return job;
  }

  public async updateJobStatus(
    employerId: string,
    jobId: string,
    newStatus: JobStatus
  ): Promise<IJob> {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found.');
    }

    if (job.employerId.toString() !== employerId) {
      throw new ForbiddenError('Only the job poster can update this job status.');
    }

    // Strict State Machine Verification
    const currentStatus = job.status;
    const validTransitions: Record<JobStatus, JobStatus[]> = {
      POSTED: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['IN_PROGRESS', 'CANCELLED', 'COMPLETED'],
      IN_PROGRESS: ['COMPLETED', 'DISPUTED', 'CANCELLED'],
      COMPLETED: ['DISPUTED'],
      CANCELLED: [],
      DISPUTED: ['COMPLETED', 'CANCELLED'],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'.`
      );
    }

    job.status = newStatus;
    await job.save();

    // If job is completed, unlock any assigned workers and increment completed jobs count
    if (newStatus === 'COMPLETED') {
      const acceptedRequests = await WorkRequest.find({
        jobId: job._id,
        status: 'ACCEPTED',
      });

      for (const req of acceptedRequests) {
        req.status = 'COMPLETED';
        req.completedAt = new Date();
        await req.save();

        // Increment worker completed count & reset availability to AVAILABLE
        await WorkerProfile.findOneAndUpdate(
          { userId: req.workerId },
          {
            $inc: { completedJobsCount: 1 },
            $set: { 'availability.status': 'AVAILABLE' },
          }
        );

        // Notify worker to rate employer
        await Notification.create({
          recipientId: req.workerId,
          type: 'JOB_COMPLETED',
          title: 'Job Completed! Please rate your employer.',
          message: `Work for "${job.title}" has finished. Share your rating to help fellow workers.`,
          actionUrl: `/worker/reviews?jobId=${job._id}`,
        });
      }
    }

    return job;
  }
}

export const jobService = new JobService();
