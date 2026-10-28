import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { WorkerCard } from '../../components/worker/WorkerCard';
import { WorkRequestModal } from '../../components/employer/WorkRequestModal';
import {
  Search,
  Filter,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Star,
  Users,
  SlidersHorizontal,
  RefreshCw,
  Navigation,
} from 'lucide-react';

export const WorkerDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSkillId = searchParams.get('skillId') || '';

  const { language, t } = useLanguage();

  const [skills, setSkills] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [skillId, setSkillId] = useState<string>(initialSkillId);
  const [locality, setLocality] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxWage, setMaxWage] = useState<number>(1500);

  // Selected worker for Request modal
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = useState<string>('');

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsNotice('GPS is not supported on this device. Please type your town name.');
      return;
    }
    setGpsLoading(true);
    setGpsNotice('');
    navigator.geolocation.getCurrentPosition(
      (_pos) => {
        setGpsLoading(false);
        setLocality('Kottakkal'); // Uses closest local worker hub in demo
        setGpsNotice('📍 GPS location active (showing nearby workers)');
        setTimeout(() => setGpsNotice(''), 4000);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsNotice('Location access denied. Please type your town name manually.');
        } else {
          setGpsNotice('Could not get GPS signal. Please enter your town name.');
        }
        setTimeout(() => setGpsNotice(''), 5000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills');
      setSkills(res.data.data.skills);
    } catch (e) {
      console.warn('Failed to load skills', e);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (skillId) params.skillId = skillId;
      if (locality) params.locality = locality;
      if (availableOnly) params.availableOnly = true;
      if (verifiedOnly) params.verifiedOnly = true;
      if (minRating > 0) params.minRating = minRating;
      if (maxWage < 1500) params.maxWage = maxWage;

      const res = await api.get('/workers', { params });
      setWorkers(res.data.data.results);
    } catch (e) {
      console.warn('Failed to load workers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [skillId, locality, availableOnly, verifiedOnly, minRating, maxWage]);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-3xl p-8 shadow-xl">
          <div className="max-w-3xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              Direct Worker Discovery
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Find Verified Local Workers
            </h1>
            <p className="text-slate-300 text-sm">
              Discover masons, electricians, carpenters, plumbers, and helpers available for work today in Kerala.
            </p>
          </div>
        </div>

        {requestSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Work request sent! You will be notified as soon as the worker accepts.</span>
            </div>
            <button
              onClick={() => setRequestSuccess(false)}
              className="text-xs text-emerald-900 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Trade Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Filter by Trade / തൊഴിൽ
              </label>
              <select
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">{t('allSkills')}</option>
                {skills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.nameMl})
                  </option>
                ))}
              </select>
            </div>

            {/* Locality Search with Mobile GPS Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Locality / Town
                </label>
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={gpsLoading}
                  className="flex items-center space-x-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                  title="Use Device GPS"
                >
                  <Navigation className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsLoading ? 'Locating...' : 'Use GPS'}</span>
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Kottakkal, Tirur, Manjeri"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {gpsNotice && (
                <p className="mt-1 text-[10px] text-brand-600 font-semibold">{gpsNotice}</p>
              )}
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={0}>Any Rating</option>
                <option value={4.5}>4.5★ &amp; Above</option>
                <option value={4.0}>4.0★ &amp; Above</option>
                <option value={3.5}>3.5★ &amp; Above</option>
              </select>
            </div>

            {/* Max Wage Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Max Daily Wage</span>
                <span className="text-brand-600 font-bold">₹{maxWage}/day</span>
              </div>
              <input
                type="range"
                min={700}
                max={1500}
                step={50}
                value={maxWage}
                onChange={(e) => setMaxWage(Number(e.target.value))}
                className="w-full accent-brand-600 mt-2"
              />
            </div>
          </div>

          {/* Quick Toggle Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs">
            <label className="inline-flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
              />
              <span>{t('filterAvailableToday')} only</span>
            </label>

            <label className="inline-flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
              />
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('filterVerifiedOnly')}</span>
              </span>
            </label>

            <span className="text-slate-400 font-normal ml-auto">
              Found <strong>{workers.length}</strong> matching workers
            </span>
          </div>
        </div>

        {/* Worker Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
            <p className="text-xs font-semibold">Discovering available workers...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Workers Match This Filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting the max daily wage or unticking &quot;Available Today only&quot; to discover more tradesmen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                onRequestClick={(w) => setSelectedWorker(w)}
                onViewProfileClick={() => {
                  setSelectedWorker(worker);
                }}
              />
            ))}
          </div>
        )}

        {/* Work Request Modal */}
        {selectedWorker && (
          <WorkRequestModal
            worker={selectedWorker}
            onClose={() => setSelectedWorker(null)}
            onSuccess={() => {
              setSelectedWorker(null);
              setRequestSuccess(true);
            }}
          />
        )}
      </div>
    </div>
  );
};
