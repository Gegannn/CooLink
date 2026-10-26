import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import { ReviewModal } from '../../components/common/ReviewModal';
import {
  Briefcase,
  Search,
  PlusCircle,
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
  IndianRupee,
  Star,
  Users,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [jobs, setJobs] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Review modal state
  const [reviewData, setReviewData] = useState<{
    jobId: string;
    targetUserId: string;
    targetUserName: string;
    workRequestId?: string;
  } | null>(null);

  const fetchEmployerData = async () => {
    try {
      const [jobsRes, requestsRes] = await Promise.all([
        api.get('/jobs', { params: { employerId: user?._id } }),
        api.get('/work-requests/employer'),
      ]);

      setJobs(jobsRes.data.data.jobs);
      setRequests(requestsRes.data.data.requests);
    } catch (e) {
      console.warn('Failed to load employer dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchEmployerData();
    }
  }, [user]);

  const handleMarkComplete = async (jobId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/status`, { status: 'COMPLETED' });
      await fetchEmployerData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to complete job.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Employer Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome, {user?.fullName}. Manage posted jobs and direct worker requests.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/employer/workers"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Search className="w-4 h-4 text-brand-600" />
              <span>Search Workers</span>
            </Link>

            <Link
              to="/employer/post-job"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Job</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-2xl font-black text-slate-900">{jobs.length}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Total Jobs Posted</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-2xl font-black text-brand-600">
              {jobs.filter((j) => j.status === 'POSTED' || j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS').length}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Active / Scheduled Jobs</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-2xl font-black text-emerald-600">
              {jobs.filter((j) => j.status === 'COMPLETED').length}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Completed Jobs</p>
          </div>
        </div>

        {/* Sent Work Requests Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Direct Work Requests Sent ({requests.length})
            </h2>
            <Link
              to="/employer/workers"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Find More Workers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No direct work requests sent yet. Search workers and click &quot;Request Worker&quot;.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((r) => (
                <div
                  key={r._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          r.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {r.status}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {r.workerId?.fullName || 'Worker'}
                      </h4>
                    </div>
                    <span className="text-sm font-black text-brand-700">
                      ₹{r.offeredWage}/day
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {r.locality} • Date: {new Date(r.jobDate).toLocaleDateString()} • {r.duration}
                  </p>

                  {r.status === 'ACCEPTED' && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-xs font-semibold text-emerald-700">
                        ✓ Worker Accepted
                      </span>
                      <div className="flex space-x-2">
                        <Link
                          to="/employer/messages"
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-brand-600 text-xs font-bold rounded-lg flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </Link>
                        <button
                          onClick={() => {
                            setReviewData({
                              jobId: r.jobId?._id || r._id,
                              targetUserId: r.workerId?._id || r.workerId,
                              targetUserName: r.workerId?.fullName || 'Worker',
                              workRequestId: r._id,
                            });
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                        >
                          Rate Worker
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posted Jobs Management */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Your Job Postings ({jobs.length})
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No jobs posted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          job.status === 'POSTED'
                            ? 'bg-purple-100 text-purple-800'
                            : job.status === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-800'
                            : job.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : job.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {job.requiredSkillId?.name || 'General Trade'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {job.locality} • ₹{job.wageOffer}/day • Needed: {job.workersNeeded} • Starts: {new Date(job.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleMarkComplete(job._id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        Mark Completed
                      </button>
                    )}

                    <Link
                      to="/employer/messages"
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      title="Messages"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {reviewData && (
          <ReviewModal
            jobId={reviewData.jobId}
            targetUserId={reviewData.targetUserId}
            targetUserName={reviewData.targetUserName}
            workRequestId={reviewData.workRequestId}
            onClose={() => setReviewData(null)}
            onSuccess={() => {
              setReviewData(null);
              fetchEmployerData();
            }}
          />
        )}
      </div>
    </div>
  );
};
