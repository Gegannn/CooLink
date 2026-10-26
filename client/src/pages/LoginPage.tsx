import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HardHat, Lock, Phone, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(phone, password);
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ||
          'Failed to sign in. Please verify your mobile number and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <HardHat className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome to CooLink
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Sign in to manage your availability or discover verified workers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('phone')} (10 digits)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  placeholder="9847123456"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : t('login')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick 1-Click Demo Accounts (Test Logins)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('9847100001', 'password123')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 text-left font-semibold transition"
              >
                👷 Ravi (Mason)
                <span className="block text-[10px] text-emerald-600 font-normal">Worker</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('9847100002', 'password123')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 text-left font-semibold transition"
              >
                👷 Suresh (Tile)
                <span className="block text-[10px] text-emerald-600 font-normal">Worker</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('9847000001', 'password123')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 text-left font-semibold transition"
              >
                🏗️ Moideen Kutty
                <span className="block text-[10px] text-blue-600 font-normal">Contractor</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('9847000000', 'adminpassword123')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 text-left font-semibold transition"
              >
                🛡️ CooLink Admin
                <span className="block text-[10px] text-purple-600 font-normal">Admin Panel</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
