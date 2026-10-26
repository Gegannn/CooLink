import React from 'react';
import { Link } from 'react-router-dom';
import {
  HardHat,
  Search,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  Lock,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
            Transparent Local Marketplace
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            How CooLink Works
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Eliminating early morning waiting at bus stands and street corners through verified digital
            profiles, instant availability toggles, and atomic booking guarantees.
          </p>
        </div>

        {/* Worker Flow */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center space-x-3 text-worker-700">
            <div className="w-10 h-10 rounded-2xl bg-worker-50 text-worker-600 flex items-center justify-center">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Daily-Wage Workers</h2>
              <p className="text-xs text-slate-500">Stop waiting at junctions in the morning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-7 h-7 rounded-full bg-worker-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-sm text-slate-900">Register &amp; Verify</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign up with your mobile number. Verify via OTP and submit your government ID to unlock the blue Verified Worker badge ✓.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-7 h-7 rounded-full bg-worker-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-900">1-Tap &quot;Available Today&quot;</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From home, tap the large green &quot;AVAILABLE&quot; button. You instantly appear at the top of local contractor search results.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-7 h-7 rounded-full bg-worker-600 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-900">Accept &amp; Earn Fair Wages</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review employer details and offered wage before accepting. Once accepted, the job is locked to prevent double-booking.
              </p>
            </div>
          </div>
        </div>

        {/* Employer Flow */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center space-x-3 text-brand-700">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Contractors &amp; House Owners</h2>
              <p className="text-xs text-slate-500">Hire verified tradesmen on short notice</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-sm text-slate-900">Filter Available Workers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by trade (Masonry, Tile Work, Electrical, Plumbing), Kerala locality, and check who is currently available today.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-900">Direct Work Request</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send a work request with your wage offer, work date, and site locality. Or publish a job for multiple workers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-900">Coordinate &amp; Review</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coordinate exact landmarks via chat. When work is finished, mark complete and rate the worker to build community reputation.
              </p>
            </div>
          </div>
        </div>

        {/* Safety & Location Guarantee */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Our Safety &amp; Anti-Exploitation Rules</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-1">
              <strong className="text-white text-sm block">1. Location Privacy</strong>
              <p>
                Exact worker home GPS is never disclosed publicly. Public cards only indicate approximate proximity (e.g. &quot;Within 5 km of Kottakkal&quot;).
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-white text-sm block">2. Double-Booking Prevention</strong>
              <p>
                Our atomic booking engine locks worker availability immediately upon acceptance. Competing requests for the same date are automatically cancelled.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-white text-sm block">3. Spam &amp; Harassment Defense</strong>
              <p>
                Direct messaging and contact details remain restricted until a work request is explicitly accepted by the worker.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-white text-sm block">4. Genuine Reviews Only</strong>
              <p>
                Only workers and employers who actually participated in a completed job assignment are permitted to leave ratings.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition"
          >
            <span>Get Started with CooLink</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
