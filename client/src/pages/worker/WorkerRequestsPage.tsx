import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  IndianRupee,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerRequestsPage: React.FC = () => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/work-requests/worker');
      setRequests(res.data.data.requests);
    } catch (e) {
      console.warn('Failed to fetch requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.patch(`/work-requests/${id}/accept`);
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to accept request.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/work-requests/${id}/reject`, { reason: 'Worker declined' });
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to decline request.');
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Work Requests &amp; Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage incoming requests and active scheduled jobs
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                statusFilter === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab} (
              {tab === 'ALL'
                ? requests.length
                : requests.filter((r) => r.status === tab).length}
              )
            </button>
          ))}
        </div>

        {/* Request Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-200">
            <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No requests found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          req.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1">
                      {req.employerId?.fullName || 'Employer'}
                    </h3>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xl font-black text-brand-700">
                      ₹{req.offeredWage}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">
                      Daily Wage Offer
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Work Date: {new Date(req.jobDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duration: {req.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Location: {req.locality}</span>
                  </div>
                </div>

                {req.instructions && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    &quot;{req.instructions}&quot;
                  </p>
                )}

                {/* Actions */}
                {req.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleReject(req._id)}
                      className="py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      {t('reject')}
                    </button>
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="py-2.5 rounded-xl bg-worker-600 hover:bg-worker-700 text-white text-xs font-bold shadow-md shadow-worker-600/20 transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('accept')}</span>
                    </button>
                  </div>
                )}

                {req.status === 'ACCEPTED' && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700">
                      ✓ Confirmed on your schedule
                    </span>
                    <Link
                      to="/worker/messages"
                      className="py-2 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Chat</span>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
