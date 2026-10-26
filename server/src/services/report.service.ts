import { Report, IReport, ReportReason, ReportStatus } from '../models/Report';
import { User } from '../models/User';
import { WorkRequest } from '../models/WorkRequest';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ReportService {
  public async submitReport(
    reporterId: string,
    data: {
      reportedUserId: string;
      jobId?: string;
      reason: ReportReason;
      description: string;
    }
  ): Promise<IReport> {
    if (reporterId === data.reportedUserId) {
      throw new BadRequestError('You cannot report yourself.');
    }

    const reportedUser = await User.findById(data.reportedUserId);
    if (!reportedUser) {
      throw new NotFoundError('Reported user not found.');
    }

    const report = await Report.create({
      reporterId,
      reportedUserId: data.reportedUserId,
      jobId: data.jobId,
      reason: data.reason,
      description: data.description,
      status: 'OPEN',
    });

    return report;
  }

  public async blockUser(userId: string, targetUserId: string): Promise<void> {
    if (userId === targetUserId) {
      throw new BadRequestError('You cannot block yourself.');
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: targetUserId },
    });
  }

  public async unblockUser(userId: string, targetUserId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: targetUserId },
    });
  }

  public async getReports(status?: ReportStatus) {
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    return Report.find(query)
      .populate('reporterId', 'fullName phone role')
      .populate('reportedUserId', 'fullName phone role status verificationStatus')
      .populate('jobId')
      .sort({ createdAt: -1 });
  }

  public async resolveReport(
    adminId: string,
    reportId: string,
    data: {
      status: 'RESOLVED' | 'DISMISSED';
      adminNotes?: string;
      takeUserAction?: 'SUSPEND' | 'BAN' | 'NONE';
    }
  ) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found.');
    }

    report.status = data.status;
    report.adminNotes = data.adminNotes;
    report.resolvedBy = adminId as unknown as import('mongoose').Types.ObjectId;
    report.resolvedAt = new Date();
    await report.save();

    if (data.takeUserAction && data.takeUserAction !== 'NONE') {
      await User.findByIdAndUpdate(report.reportedUserId, {
        status: data.takeUserAction === 'BAN' ? 'BANNED' : 'SUSPENDED',
      });
    }

    return report;
  }

  /**
   * Fraud & Suspicious Behaviour Detection Hook:
   * Aggregates signals like repeated cancellations, multiple reports, or low account age.
   */
  public async detectSuspiciousSignals(userId: string) {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // 1. Repeated cancellations
    const recentCancellations = await WorkRequest.countDocuments({
      cancelledBy: userId,
      createdAt: { $gte: fortyEightHoursAgo },
    });

    // 2. Open reports against user
    const openReportsCount = await Report.countDocuments({
      reportedUserId: userId,
      status: { $in: ['OPEN', 'INVESTIGATING'] },
    });

    const isSuspicious = recentCancellations >= 3 || openReportsCount >= 2;

    return {
      userId,
      isSuspicious,
      signals: {
        recentCancellations,
        openReportsCount,
      },
      recommendation: isSuspicious ? 'FLAG_FOR_ADMIN_AUDIT' : 'CLEAR',
    };
  }
}

export const reportService = new ReportService();
