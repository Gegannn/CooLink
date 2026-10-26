import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Search,
  Lock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'VERIFICATIONS' | 'REPORTS' | 'USERS'>('VERIFICATIONS');
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Review modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const fetchAdminData = async () => {
    try {
      const [metricsRes, verificationsRes, reportsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/verifications/pending'),
        api.get('/reports'),
        api.get('/admin/users'),
      ]);

      setMetrics(metricsRes.data.data.metrics);
      setPendingVerifications(verificationsRes.data.data.requests);
      setReports(reportsRes.data.data.reports);
      setUsersList(usersRes.data.data.users);
    } catch (e) {
      console.warn('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveVerification = async (id: string) => {
    try {
      await api.patch(`/verifications/${id}/review`, { decision: 'APPROVE' });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Approval failed.');
    }
  };

  const handleRejectVerification = async (id: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting the verification document.');
      return;
    }

    try {
      await api.patch(`/verifications/${id}/review`, {
        decision: 'REJECT',
        rejectionReason: rejectReason,
      });
      setRejectingId(null);
      setRejectReason('');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Rejection failed.');
    }
  };

  const handleResolveReport = async (reportId: string, action: 'SUSPEND' | 'BAN' | 'NONE') => {
    try {
      await api.patch(`/reports/${reportId}/resolve`, {
        status: 'RESOLVED',
        adminNotes: 'Reviewed and resolved by admin team.',
        takeUserAction: action,
      });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to resolve report.');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-slate-400">Strictly Restricted Access</span>
            </div>
            <h1 className="text-3xl font-black mt-1">Platform Moderation &amp; Verification</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review government identity documents, resolve user disputes, and monitor fraud signals.
            </p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-2xl font-black text-slate-900">{metrics?.totalWorkers || 0}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Registered Workers</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-2xl font-black text-blue-600">{metrics?.verifiedUsers || 0}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Govt ID Verified ✓</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-2xl font-black text-emerald-600">{metrics?.jobsCompleted || 0}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Completed Jobs</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-2xl font-black text-red-600">{metrics?.openReports || 0}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Open Reports / Disputes</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-3 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('VERIFICATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'VERIFICATIONS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ID Verification Queue ({pendingVerifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'REPORTS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reports &amp; Fraud ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'USERS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Directory ({usersList.length})</span>
          </button>
        </div>

        {/* TAB 1: ID VERIFICATION QUEUE */}
        {activeTab === 'VERIFICATIONS' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Pending Government ID Verifications
            </h2>

            {pendingVerifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                All verification submissions have been reviewed! Zero backlog.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerifications.map((v) => (
                  <div
                    key={v._id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {v.documentType}
                        </span>
                        <span className="text-xs font-mono text-slate-600">
                          {v.documentNumberMasked}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900">
                        {v.userId?.fullName} ({v.userId?.phone})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Role: {v.userId?.role} • Submitted: {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <a
                        href={v.documentFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Doc</span>
                      </a>

                      <button
                        onClick={() => handleApproveVerification(v._id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Badge</span>
                      </button>

                      <button
                        onClick={() => setRejectingId(v._id)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl"
                      >
                        Reject
                      </button>
                    </div>

                    {rejectingId === v._id && (
                      <div className="w-full mt-3 p-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
                        <input
                          type="text"
                          placeholder="Reason for rejection (e.g. Unclear photo, name mismatch)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-red-300 rounded-lg text-slate-900"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-3 py-1 text-xs text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRejectVerification(v._id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REPORTS & FRAUD MODERATION */}
        {activeTab === 'REPORTS' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Community Reports &amp; Disputes
            </h2>

            {reports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Zero active dispute reports. Community trust is healthy!
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((rep) => (
                  <div
                    key={rep._id}
                    className="p-5 rounded-2xl border border-red-100 bg-red-50/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">
                        {rep.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      &quot;{rep.description}&quot;
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-500">Reporter: </span>
                        <strong className="text-slate-800">{rep.reporterId?.fullName}</strong>
                        <span className="mx-2">•</span>
                        <span className="text-slate-500">Reported User: </span>
                        <strong className="text-slate-800">{rep.reportedUserId?.fullName} ({rep.reportedUserId?.phone})</strong>
                      </div>

                      {rep.status === 'OPEN' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResolveReport(rep._id, 'NONE')}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'SUSPEND')}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                          >
                            Suspend User
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep._id, 'BAN')}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                          >
                            Ban Account
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USERS DIRECTORY */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Registered Users Directory</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Name &amp; Mobile</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Phone Verified</th>
                    <th className="py-3 px-4">Govt ID Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {u.fullName}
                        <span className="block font-normal text-slate-500 font-mono text-[11px]">
                          +91 {u.phone}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isPhoneVerified ? (
                          <span className="text-emerald-600 font-bold">✓ Verified</span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.verificationStatus === 'VERIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${
                          u.status === 'ACTIVE'
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            u.status === 'ACTIVE'
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
