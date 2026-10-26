import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';
import {
  HardHat,
  Search,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Users,
  AlertTriangle,
  Building2,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [skills, setSkills] = useState<Array<{ _id: string; name: string; nameMl: string; defaultMinWage: number; defaultMaxWage: number }>>([]);
  const [stats, setStats] = useState({
    totalWorkers: 10,
    activeAvailableWorkers: 8,
    jobsCompleted: 154,
    platformAverageRating: 4.8,
  });

  useEffect(() => {
    api.get('/skills').then((res) => setSkills(res.data.data.skills)).catch(() => {});
    api.get('/admin/analytics').then((res) => {
      if (res.data.data?.metrics) {
        setStats(res.data.data.metrics);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/30 text-brand-300 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live in Kerala: Kottakkal, Tirur, Malappuram, Manjeri</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Find Work. Find Workers.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-300">
              Without Waiting.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Stop physically waiting at bus stands, railway stations, and junctions hoping for work.
            Connect directly with verified local workers and contractors with upfront wage transparency.
          </p>

          {/* Two Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <button
              onClick={() => {
                if (user?.role === 'WORKER') navigate('/worker/dashboard');
                else navigate('/register?role=WORKER');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-worker-600 hover:bg-worker-700 text-white font-black text-base shadow-lg shadow-worker-600/30 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-2"
            >
              <HardHat className="w-5 h-5" />
              <span>{t('imLookingForWork')}</span>
            </button>

            <button
              onClick={() => {
                if (user?.role === 'EMPLOYER') navigate('/employer/workers');
                else navigate('/employer/workers');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-base shadow-lg shadow-brand-600/30 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>{t('iNeedWorkers')}</span>
            </button>
          </div>

          {/* Live Quick Counter */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80">
            <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {stats.activeAvailableWorkers}+
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Available Today</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-400">
                {stats.totalWorkers}+
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Verified Workers</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                ★ {stats.platformAverageRating}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Average Rating</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">
                {stats.jobsCompleted}+
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">Completed Jobs</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Problem vs CooLink Solution */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
            Why CooLink Exists
          </h2>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            Replacing Physical Gathering Points With Digital Trust
          </h3>
          <p className="text-slate-600 mt-3 text-base">
            For decades, thousands of daily-wage workers traveled before sunrise to stand at bus stands
            and junctions, waiting for hours in uncertainty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Way */}
          <div className="bg-red-50/60 rounded-3xl p-8 border border-red-200/80 space-y-5">
            <div className="flex items-center space-x-3 text-red-700 font-bold">
              <div className="p-2 rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-lg">The Traditional Morning Stand</span>
            </div>
            <ul className="space-y-3 text-sm text-red-950 font-medium">
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Workers spend money travelling to junctions without guaranteed work</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Wages, duration, and exact work locations are uncertain before reaching the site</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>No digital work history, verified skills, or protection against exploitation</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Contractors waste time searching randomly at morning gathering points</span>
              </li>
            </ul>
          </div>

          {/* The CooLink Way */}
          <div className="bg-emerald-50/60 rounded-3xl p-8 border border-emerald-200/80 space-y-5">
            <div className="flex items-center space-x-3 text-emerald-800 font-bold">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-lg">The CooLink Marketplace</span>
            </div>
            <ul className="space-y-3 text-sm text-emerald-950 font-medium">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Worker taps <strong>&quot;AVAILABLE TODAY&quot;</strong> from home; contractors discover them instantly</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Transparent daily wage expectation &amp; job scope agreed before acceptance</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Atomic booking engine prevents double-booking and safeguards schedules</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Government ID verification badge ✓ and real customer reviews build digital trust</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Trades */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
                Explore Categories
              </h2>
              <h3 className="text-2xl font-black text-slate-900">
                Find Skilled Workers By Trade
              </h3>
            </div>
            <Link
              to="/employer/workers"
              className="mt-4 md:mt-0 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All Available Workers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {skills.map((skill) => (
              <Link
                key={skill._id}
                to={`/employer/workers?skillId=${skill._id}`}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 transition text-center group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white group-hover:bg-brand-600 group-hover:text-white text-slate-700 flex items-center justify-center shadow-sm transition mb-3">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-700">
                    {language === 'ml' ? skill.nameMl : skill.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ml' ? skill.name : skill.nameMl}
                  </p>
                </div>
                <p className="text-xs font-semibold text-brand-600 mt-3 pt-2 border-t border-slate-200/60">
                  ₹{skill.defaultMinWage} - ₹{skill.defaultMaxWage}/day
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Highlights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-white">
          <div className="max-w-3xl space-y-6">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              Safety & Privacy Guaranteed
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Built on Real Verification, Zero Hidden Identity Leaks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300 pt-2">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Location Privacy:</strong> Worker home address and exact GPS are masked with approximate locality radius.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Govt ID Badges:</strong> Aadhaar / Voter ID verified via human review before the badge is displayed.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Bi-directional Reviews:</strong> Only workers and employers who completed a real job can rate each other.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Spam Protection:</strong> Direct phone numbers and messaging are unlocked only after job request acceptance.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
