import { WorkRequest, IWorkRequest, WorkRequestStatus } from '../models/WorkRequest';
import { WorkerProfile } from '../models/WorkerProfile';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { Notification } from '../models/Notification';

export class WorkRequestService {
  public async createWorkRequest(
    employerId: string,
    data: {
      workerId: string;
      jobId?: string;
      offeredWage: number;
      jobDate: string | Date;
      duration?: string;
      locality: string;
      instructions?: string;
    }
  ): Promise<IWorkRequest> {
    const employer = await User.findById(employerId);
    if (!employer) {
      throw new NotFoundError('Employer account not found.');
    }

    const worker = await User.findById(data.workerId);
    if (!worker || worker.role !== 'WORKER') {
      throw new BadRequestError('Target user is not a registered worker.');
    }

    if (worker.status !== 'ACTIVE') {
      throw new BadRequestError('This worker is currently not active.');
    }

    // Check worker profile & current availability
    const profile = await WorkerProfile.findOne({ userId: data.workerId });
    if (!profile) {
      throw new NotFoundError('Worker profile not found.');
    }

    if (profile.availability.status === 'NOT_AVAILABLE') {
      throw new BadRequestError('This worker is currently not available for work.');
    }

    const jobDate = new Date(data.jobDate);
    // Expiry: 60 minutes from now or job date, whichever is sooner
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const request = await WorkRequest.create({
      jobId: data.jobId,
      employerId,
      workerId: data.workerId,
      offeredWage: data.offeredWage,
      jobDate,
      duration: data.duration || '1 day',
      locality: data.locality,
      instructions: data.instructions,
      status: 'PENDING',
      expiresAt,
    });

    // Notify worker
    await Notification.create({
      recipientId: data.workerId,
      type: 'REQUEST_RECEIVED',
      title: 'New Work Request! / പുതിയ തൊഴിൽ അഭ്യർത്ഥന',
      message: `${employer.fullName} has offered you a job in ${data.locality} for ₹${data.offeredWage}.`,
      actionUrl: `/worker/requests`,
    });

    return request;
  }

  /**
   * Atomic acceptance preventing double-booking:
   * Uses atomic findOneAndUpdate to transition worker availability to 'BUSY'
   */
  public async acceptWorkRequest(workerId: string, requestId: string): Promise<IWorkRequest> {
    const request = await WorkRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError('Work request not found.');
    }

    if (request.workerId.toString() !== workerId) {
      throw new ForbiddenError('You are not authorized to accept this work request.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError(`Cannot accept request in '${request.status}' state.`);
    }

    if (new Date() > request.expiresAt) {
      request.status = 'EXPIRED';
      await request.save();
      throw new BadRequestError('This work request has expired.');
    }

    // ATOMIC RESERVATION LOCK:
    // Only succeeds if worker is currently AVAILABLE
    const profile = await WorkerProfile.findOneAndUpdate(
      {
        userId: workerId,
        'availability.status': 'AVAILABLE',
      },
      {
        $set: {
          'availability.status': 'BUSY',
          'availability.updatedAt': new Date(),
        },
      },
      { new: true }
    );

    if (!profile) {
      throw new ConflictError(
        'You are already marked as BUSY or booked for another work assignment. Double-booking prevented.'
      );
    }

    request.status = 'ACCEPTED';
    request.acceptedAt = new Date();
    await request.save();

    // If tied to a Job, update job status
    if (request.jobId) {
      await Job.findByIdAndUpdate(request.jobId, {
        $inc: { workersHired: 1 },
        $set: { status: 'ASSIGNED' },
      });
    }

    // Auto-cancel any other pending requests for this worker on the same date to avoid double-booking
    await WorkRequest.updateMany(
      {
        _id: { $ne: request._id },
        workerId,
        status: 'PENDING',
        jobDate: {
          $gte: new Date(request.jobDate.setHours(0, 0, 0, 0)),
          $lte: new Date(request.jobDate.setHours(23, 59, 59, 999)),
        },
      },
      {
        $set: {
          status: 'CANCELLED',
          cancelReason: 'Worker accepted another booking for this date.',
        },
      }
    );

    // Notify Employer
    await Notification.create({
      recipientId: request.employerId,
      type: 'REQUEST_ACCEPTED',
      title: 'Worker Accepted Your Request! / തൊഴിലാളി സ്വീകരിച്ചു',
      message: `Your work request for ₹${request.offeredWage} was accepted. You can now coordinate via messages.`,
      actionUrl: `/employer/jobs`,
    });

    return request;
  }

  public async rejectWorkRequest(
    workerId: string,
    requestId: string,
    reason?: string
  ): Promise<IWorkRequest> {
    const request = await WorkRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError('Work request not found.');
    }

    if (request.workerId.toString() !== workerId) {
      throw new ForbiddenError('You are not authorized to modify this work request.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError(`Cannot reject request in '${request.status}' state.`);
    }

    request.status = 'REJECTED';
    request.cancelReason = reason || 'Worker declined request';
    await request.save();

    // Notify Employer
    await Notification.create({
      recipientId: request.employerId,
      type: 'REQUEST_REJECTED',
      title: 'Work Request Declined',
      message: `Worker was unable to accept your work request. You may contact other available workers.`,
      actionUrl: `/employer/workers`,
    });

    return request;
  }

  public async getRequestsForWorker(workerId: string, status?: WorkRequestStatus) {
    const query: Record<string, unknown> = { workerId };
    if (status) query.status = status;

    return WorkRequest.find(query)
      .populate('employerId', 'fullName phone isPhoneVerified')
      .populate('jobId')
      .sort({ createdAt: -1 });
  }

  public async getRequestsByEmployer(employerId: string, status?: WorkRequestStatus) {
    const query: Record<string, unknown> = { employerId };
    if (status) query.status = status;

    return WorkRequest.find(query)
      .populate('workerId', 'fullName phone isPhoneVerified')
      .populate('jobId')
      .sort({ createdAt: -1 });
  }
}

export const workRequestService = new WorkRequestService();
