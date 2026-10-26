import React, { useState } from 'react';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { X, Send, AlertCircle, Calendar, MapPin, IndianRupee, Clock } from 'lucide-react';

interface WorkRequestModalProps {
  worker: {
    _id: string;
    workerId: string;
    fullName: string;
    primarySkill?: { name: string; nameMl: string };
    dailyWageMin: number;
    dailyWageMax: number;
    locality: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const WorkRequestModal: React.FC<WorkRequestModalProps> = ({
  worker,
  onClose,
  onSuccess,
}) => {
  const { language, t } = useLanguage();

  const [offeredWage, setOfferedWage] = useState<number>(worker.dailyWageMin || 1000);
  const [jobDate, setJobDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [duration, setDuration] = useState<string>('1 day');
  const [locality, setLocality] = useState<string>(worker.locality || 'Kottakkal');
  const [instructions, setInstructions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/work-requests', {
        workerId: worker.workerId,
        offeredWage,
        jobDate,
        duration,
        locality,
        instructions,
      });

      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ||
          'Failed to dispatch work request. Please check worker availability.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider mb-1">
            Send Work Request / തൊഴിൽ ക്ഷണം
          </p>
          <h2 className="text-xl font-bold">Request {worker.fullName}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Skill: {language === 'ml' ? worker.primarySkill?.nameMl : worker.primarySkill?.name} • Expected: ₹{worker.dailyWageMin} - ₹{worker.dailyWageMax}/day
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Wage Offer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Offered Daily Wage (₹) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min={100}
                max={10000}
                required
                value={offeredWage}
                onChange={(e) => setOfferedWage(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Scheduled Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Work Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={jobDate}
                  onChange={(e) => setJobDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Expected Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="1 day">1 day (ഒരു ദിവസം)</option>
                <option value="2 days">2 days (രണ്ട് ദിവസം)</option>
                <option value="3-5 days">3 - 5 days</option>
                <option value="1 week+">1 week or more</option>
              </select>
            </div>
          </div>

          {/* Work Locality */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Work Location / Locality *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Near Kottakkal Bus Stand, Malappuram"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Description / Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Need brick wall plastering and pillar finishing. Please bring standard trowel."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500">
            🔒 Direct contact details will be shared once the worker accepts your request. Double booking is prevented automatically.
          </div>

          {/* Submit Action */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Send Work Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
