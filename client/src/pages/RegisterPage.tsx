import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HardHat, Users, ShieldCheck, Lock, Phone, Mail, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'WORKER';

  const { register } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [adminSetupKey, setAdminSetupKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await register({
        fullName,
        phone,
        email: email.trim() || undefined,
        password,
        role,
        adminSetupKey: role === 'ADMIN' ? adminSetupKey : undefined,
      });

      const target = res.otpTarget || email.trim() || phone;
      const channel = res.otpChannel || (email.trim() ? 'EMAIL' : 'SMS');

      // Navigate to OTP verification page
      navigate(
        `/verify-otp?target=${encodeURIComponent(target)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&channel=${channel}`,
        {
          state: {
            debugOtp: res.debugOtp,
            target,
            channel,
            email: email.trim(),
            phone,
          },
        }
      );
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ||
          'Registration failed. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
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
          Create Your Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Join Kerala&apos;s verified daily-wage worker and employer network
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

          {/* Role Switcher */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('WORKER')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center space-y-1 ${
                  role === 'WORKER'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold ring-2 ring-brand-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HardHat className="w-5 h-5 text-brand-600" />
                <span className="text-xs">Worker (തൊഴിലാളി)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('EMPLOYER')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center space-y-1 ${
                  role === 'EMPLOYER'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold ring-2 ring-brand-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-5 h-5 text-brand-600" />
                <span className="text-xs">Employer (തൊഴിൽദായകൻ)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('fullName')} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ravi Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (For Free OTP Verification) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Your 6-digit verification code will be dispatched to this email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('phone')} (10-digit Indian Mobile) *
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
                {t('password')} (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {role === 'ADMIN' && (
              <div>
                <label className="block text-xs font-bold text-purple-700 mb-1">
                  Admin Setup Secret Key *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter admin setup master key"
                  value={adminSetupKey}
                  onChange={(e) => setAdminSetupKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Sending Verification Code...' : 'Get Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
