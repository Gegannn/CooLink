import { VerificationRequest, IVerificationRequest, VerificationDocType } from '../models/VerificationRequest';
import { User } from '../models/User';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { Notification } from '../models/Notification';

export class VerificationService {
  public async submitVerification(
    userId: string,
    data: {
      documentType: VerificationDocType;
      documentNumberMasked: string;
      documentFileUrl: string;
      selfieFileUrl?: string;
    }
  ): Promise<IVerificationRequest> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // Invalidate prior pending requests
    await VerificationRequest.deleteMany({ userId, status: 'PENDING' });

    const request = await VerificationRequest.create({
      userId,
      documentType: data.documentType,
      documentNumberMasked: data.documentNumberMasked,
      documentFileUrl: data.documentFileUrl,
      selfieFileUrl: data.selfieFileUrl,
      status: 'PENDING',
    });

    user.verificationStatus = 'PENDING';
    await user.save();

    return request;
  }

  public async getPendingVerifications() {
    return VerificationRequest.find({ status: 'PENDING' })
      .select('+documentFileUrl +selfieFileUrl')
      .populate('userId', 'fullName phone role createdAt')
      .sort({ createdAt: -1 });
  }

  public async reviewVerification(
    adminId: string,
    requestId: string,
    decision: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ): Promise<IVerificationRequest> {
    const request = await VerificationRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError('Verification request not found.');
    }

    const user = await User.findById(request.userId);
    if (!user) {
      throw new NotFoundError('Target user not found.');
    }

    if (decision === 'APPROVE') {
      request.status = 'VERIFIED';
      request.reviewedBy = adminId as unknown as import('mongoose').Types.ObjectId;
      request.reviewedAt = new Date();
      await request.save();

      user.verificationStatus = 'VERIFIED';
      await user.save();

      await Notification.create({
        recipientId: user._id,
        type: 'VERIFICATION_UPDATE',
        title: 'Identity Verified! / തിരിച്ചറിയൽ കാർഡ് അംഗീകരിച്ചു',
        message: 'Congratulations! Your profile now has the Verified Badge ✓.',
        actionUrl: '/worker/profile',
      });
    } else {
      if (!rejectionReason) {
        throw new BadRequestError('A reason must be provided when rejecting a verification request.');
      }

      request.status = 'REJECTED';
      request.rejectionReason = rejectionReason;
      request.reviewedBy = adminId as unknown as import('mongoose').Types.ObjectId;
      request.reviewedAt = new Date();
      await request.save();

      user.verificationStatus = 'REJECTED';
      await user.save();

      await Notification.create({
        recipientId: user._id,
        type: 'VERIFICATION_UPDATE',
        title: 'Identity Verification Rejected',
        message: `Your verification could not be approved: ${rejectionReason}. Please re-submit valid documents.`,
        actionUrl: '/worker/profile',
      });
    }

    return request;
  }
}

export const verificationService = new VerificationService();
