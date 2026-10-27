import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Phone, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const stateTarget = (location.state as { target?: string })?.target;
  const stateEmail = (location.state as { email?: string })?.email;
  const statePhone = (location.state as { phone?: string })?.phone;
  const stateChannel = (location.state as { channel?: 'EMAIL' | 'SMS' })?.channel;

  const paramTarget = searchParams.get('target') || '';
  const paramPhone = searchParams.get('phone') || '';
  const paramEmail = searchParams.get('email') || '';
  const paramChannel = searchParams.get('channel') as 'EMAIL' | 'SMS' | null;

  const target = stateTarget || paramTarget || stateEmail || paramEmail || statePhone || paramPhone;
  const email = stateEmail || paramEmail || (target.includes('@') ? target : '');
  const phone = statePhone || paramPhone || (!target.includes('@') ? target : '');
  const isEmail = stateChannel === 'EMAIL' || paramChannel === 'EMAIL' || target.includes('@');

  const initialDebugOtp = (location.state as { debugOtp?: string })?.debugOtp;

  const { verifyOtp, sendOtp, user } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string>(initialDebugOtp || '');
  const [debugOtp, setDebugOtp] = useState<string | undefined>(initialDebugOtp);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyOtp(target, otp, email || undefined);
      setSuccess(`${isEmail ? 'Email' : 'Phone'} verified successfully!`);

      setTimeout(() => {
        if (user?.role === 'WORKER') {
          navigate('/worker/dashboard');
        } else if (user?.role === 'EMPLOYER') {
          navigate('/employer/workers');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ||
          'Invalid OTP. Please check the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await sendOtp(target, email || undefined);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
        setOtp(res.debugOtp);
      }
      setSuccess(`A new verification code has been dispatched to your ${isEmail ? 'email' : 'phone'}.`);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosError.response?.data?.error?.message ||
          'Failed to resend code. Please wait a moment before retrying.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            {isEmail ? <Mail className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isEmail ? 'Verify Your Email' : 'Verify Mobile Number'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          We sent a 6-digit verification code to{' '}
          <strong className="text-slate-900">{isEmail ? email : `+91 ${phone}`}</strong>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {debugOtp && (
            <div className="mb-4 p-3 rounded-2xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
              🛠️ <strong>{isEmail ? 'Dev Mode Email Logger' : 'Dev Mode SMS Logger'}:</strong> OTP is{' '}
              <span className="font-mono text-sm tracking-widest bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-bold">
                {debugOtp}
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl border border-slate-200 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Sending...' : 'Resend Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
