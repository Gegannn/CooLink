import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import {
  HardHat,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase,
  Star,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  MapPin,
  Calendar,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const fetchWorkerData = async () => {
    try {
      const [profileRes, requestsRes] = await Promise.all([
        api.get('/workers/profile/me'),
        api.get('/work-requests/worker'),
      ]);

      setProfile(profileRes.data.data.profile);
      setRequests(requestsRes.data.data.requests);
    } catch (err) {
      console.warn('Error loading worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const handleAvailabilityToggle = async (
    status: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE',
    availableFor: 'TODAY' | 'TOMORROW' = 'TODAY'
  ) => {
    try {
      setActionLoading('status');
      const res = await api.patch('/workers/availability', {
        status,
        availableFor,
      });

      if (profile) {
        setProfile({ ...profile, availability: res.data.data.availability });
      }

      setStatusMessage(
        status === 'AVAILABLE'
          ? 'You are now marked as AVAILABLE! Contractors can find you.'
          : status === 'BUSY'
          ? 'Marked as BUSY. You will not receive competing bookings.'
          : 'Marked as NOT AVAILABLE for today.'
      );

      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.patch(`/work-requests/${requestId}/accept`);
      await fetchWorkerData();
      setStatusMessage('Request accepted! Job locked into your schedule.');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to accept request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.patch(`/work-requests/${requestId}/reject`, { reason: 'Worker declined' });
      await fetchWorkerData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to decline request.');
    } finally {
      setActionLoading(null);
    }
  };

  const currentStatus = profile?.availability?.status || 'AVAILABLE';
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const activeAcceptedJobs = requests.filter((r) => r.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Verification Alert Banner if not verified */}
        {user?.verificationStatus !== 'VERIFIED' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Identity Verification Pending (തിരിച്ചറിയൽ കാർഡ് ചേർക്കുക)
                </p>
                <p className="text-[11px] text-amber-700">
                  Submit government ID to receive the blue Verified Badge ✓ and get 3x more work requests.
                </p>
              </div>
            </div>
            <Link
              to="/worker/profile"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex-shrink-0 ml-2"
            >
              Verify Now
            </Link>
          </div>
        )}

        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* PRIMARY AVAILABILITY ENGINE (ULTRA LARGE BUTTONS) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 text-center space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-black text-brand-600 uppercase tracking-widest">
              Live Availability / നിങ്ങളുടെ ലഭ്യത
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('areYouAvailable')}
            </h1>
            <p className="text-xs text-slate-500">
              Contractors search for available workers right now. Tap once to update:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
            {/* AVAILABLE BUTTON */}
            <button
              onClick={() => handleAvailabilityToggle('AVAILABLE', 'TODAY')}
              disabled={actionLoading === 'status'}
              className={`py-5 px-4 rounded-2xl font-black text-sm sm:text-base transition flex flex-col items-center justify-center space-y-2 border-2 shadow-sm ${
                currentStatus === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-500/20 scale-[1.02]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span>{t('available')}</span>
              <span className="text-[11px] font-normal opacity-90">
                {language === 'ml' ? 'ഇന്ന് പണിക്ക് പോകാം' : 'Ready for work today'}
              </span>
            </button>

            {/* BUSY BUTTON */}
            <button
              onClick={() => handleAvailabilityToggle('BUSY')}
              disabled={actionLoading === 'status'}
              className={`py-5 px-4 rounded-2xl font-black text-sm sm:text-base transition flex flex-col items-center justify-center space-y-2 border-2 shadow-sm ${
                currentStatus === 'BUSY'
                  ? 'bg-amber-600 text-white border-amber-600 ring-4 ring-amber-500/20 scale-[1.02]'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <span>{t('busy')}</span>
              <span className="text-[11px] font-normal opacity-90">
                {language === 'ml' ? 'നിലവിൽ പണിയിലാണ്' : 'Currently on a job'}
              </span>
            </button>

            {/* NOT AVAILABLE BUTTON */}
            <button
              onClick={() => handleAvailabilityToggle('NOT_AVAILABLE')}
              disabled={actionLoading === 'status'}
              className={`py-5 px-4 rounded-2xl font-black text-sm sm:text-base transition flex flex-col items-center justify-center space-y-2 border-2 shadow-sm ${
                currentStatus === 'NOT_AVAILABLE'
                  ? 'bg-slate-700 text-white border-slate-700 ring-4 ring-slate-500/20 scale-[1.02]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <span>{t('notAvailable')}</span>
              <span className="text-[11px] font-normal opacity-90">
                {language === 'ml' ? 'ഇന്ന് പണിക്ക് പറ്റില്ല' : 'Off duty today'}
              </span>
            </button>
          </div>
        </div>

        {/* WORKER QUICK STATS */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {profile?.completedJobsCount || 0}
            </p>
            <p className="text-xs text-slate-500 font-semibold">{t('completedJobs')}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xl sm:text-2xl font-black text-amber-500 flex items-center justify-center space-x-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{profile?.averageRating > 0 ? profile.averageRating.toFixed(1) : '5.0'}</span>
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              {profile?.totalReviews || 0} {t('reviews')}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xl sm:text-2xl font-black text-brand-600">
              ₹{profile?.dailyWageMin || 900}
            </p>
            <p className="text-xs text-slate-500 font-semibold">{t('dailyWage')}</p>
          </div>
        </div>

        {/* INCOMING WORK REQUESTS (PENDING APPROVAL) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-urgent-500 animate-ping"></span>
              <h2 className="text-base font-bold text-slate-900">
                {t('newWorkRequest')} ({pendingRequests.length})
              </h2>
            </div>
            <Link
              to="/worker/requests"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium">
                No pending work requests at the moment. Keep availability marked as AVAILABLE!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl border border-brand-200 bg-brand-50/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {req.employerId?.fullName || 'Contractor Request'}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.locality}</span>
                        <span>•</span>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(req.jobDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{req.duration}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-brand-700">
                        ₹{req.offeredWage}
                      </span>
                      <span className="block text-[10px] text-slate-500">Offered Daily Wage</span>
                    </div>
                  </div>

                  {req.instructions && (
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80">
                      &quot;{req.instructions}&quot;
                    </p>
                  )}

                  {/* Accept / Decline actions */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => handleRejectRequest(req._id)}
                      disabled={actionLoading === req._id}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                    >
                      {t('reject')}
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req._id)}
                      disabled={actionLoading === req._id}
                      className="py-2.5 px-4 rounded-xl bg-worker-600 hover:bg-worker-700 text-white text-xs font-bold shadow-md shadow-worker-600/20 transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('accept')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE ACCEPTED JOBS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Active Scheduled Jobs ({activeAcceptedJobs.length})
          </h2>

          {activeAcceptedJobs.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              No jobs currently in progress.
            </p>
          ) : (
            <div className="space-y-3">
              {activeAcceptedJobs.map((job) => (
                <div
                  key={job._id}
                  className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      SCHEDULED / CONFIRMED
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">
                      {job.employerId?.fullName}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {job.locality} • ₹{job.offeredWage} • {new Date(job.jobDate).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    to="/worker/messages"
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-brand-600 text-xs font-bold flex items-center space-x-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
