import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Users,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const PostJobPage: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [skills, setSkills] = useState<any[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [requiredSkillId, setRequiredSkillId] = useState<string>('');
  const [workersNeeded, setWorkersNeeded] = useState<number>(1);
  const [wageOffer, setWageOffer] = useState<number>(1100);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [durationDays, setDurationDays] = useState<number>(2);
  const [startTime, setStartTime] = useState<string>('08:00 AM');
  const [locality, setLocality] = useState<string>('Kottakkal');
  const [district, setDistrict] = useState<string>('Malappuram');
  const [landmark, setLandmark] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.get('/skills').then((res) => {
      setSkills(res.data.data.skills);
      if (res.data.data.skills.length > 0) {
        setRequiredSkillId(res.data.data.skills[0]._id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/jobs', {
        title,
        description,
        requiredSkillId,
        workersNeeded,
        wageOffer,
        wageType: 'DAILY',
        startDate,
        durationDays,
        startTime,
        locality,
        district,
        landmark,
      });

      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to post job. Please ensure all required fields are filled.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Post a New Job Opportunity / പുതിയ ജോലി നൽകുക
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify worker requirements, daily wage, and site location in Kerala
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Need 2 Masons for House Plastering"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Trade & Workers Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Trade / തൊഴിൽ *
              </label>
              <select
                required
                value={requiredSkillId}
                onChange={(e) => setRequiredSkillId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {skills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.nameMl})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Number of Workers Needed *
              </label>
              <input
                type="number"
                min={1}
                max={25}
                required
                value={workersNeeded}
                onChange={(e) => setWorkersNeeded(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Wage Offer & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily Wage per Worker (₹) *
              </label>
              <input
                type="number"
                min={200}
                required
                value={wageOffer}
                onChange={(e) => setWageOffer(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration (Days) *
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Town / Locality *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kottakkal"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Landmark / Work Site Address
              </label>
              <input
                type="text"
                placeholder="e.g. Near Ayurveda Hospital Junction"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Description &amp; Scope *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Need experienced masons for second floor concrete wall construction and plastering. Tools provided on site."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Posting Job...' : 'Publish Job Opportunity'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
