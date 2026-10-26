import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import {
  HardHat,
  Bell,
  Globe,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Briefcase,
  Search,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      api
        .get('/notifications')
        .then((res) => setUnreadCount(res.data.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Coo<span className="text-brand-600">Link</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                കൂലിങ്ക്
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/how-it-works"
              className="text-slate-600 hover:text-brand-600 transition-colors"
            >
              How it Works
            </Link>

            {user?.role === 'WORKER' && (
              <>
                <Link
                  to="/worker/dashboard"
                  className="text-slate-700 hover:text-brand-600 font-semibold flex items-center space-x-1"
                >
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>{t('dashboard')}</span>
                </Link>
                <Link
                  to="/worker/requests"
                  className="text-slate-700 hover:text-brand-600"
                >
                  Work Requests
                </Link>
                <Link
                  to="/worker/profile"
                  className="text-slate-700 hover:text-brand-600"
                >
                  {t('profile')}
                </Link>
              </>
            )}

            {user?.role === 'EMPLOYER' && (
              <>
                <Link
                  to="/employer/workers"
                  className="text-slate-700 hover:text-brand-600 font-semibold flex items-center space-x-1"
                >
                  <Search className="w-4 h-4 text-brand-600" />
                  <span>Find Workers</span>
                </Link>
                <Link
                  to="/employer/post-job"
                  className="text-slate-700 hover:text-brand-600 font-semibold"
                >
                  {t('postJob')}
                </Link>
                <Link
                  to="/employer/dashboard"
                  className="text-slate-700 hover:text-brand-600"
                >
                  {t('dashboard')}
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 font-bold flex items-center space-x-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notification Bell */}
                <Link
                  to={user.role === 'WORKER' ? '/worker/requests' : '/employer/dashboard'}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Info & Logout */}
                <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {user.role} {user.verificationStatus === 'VERIFIED' && '✓'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700"
          >
            How it Works
          </Link>
          {user ? (
            <>
              {user.role === 'WORKER' && (
                <>
                  <Link
                    to="/worker/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 font-bold text-brand-600"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    to="/worker/requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-slate-700"
                  >
                    Work Requests
                  </Link>
                  <Link
                    to="/worker/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-slate-700"
                  >
                    {t('profile')}
                  </Link>
                </>
              )}
              {user.role === 'EMPLOYER' && (
                <>
                  <Link
                    to="/employer/workers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 font-bold text-brand-600"
                  >
                    Find Workers
                  </Link>
                  <Link
                    to="/employer/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-slate-700"
                  >
                    {t('postJob')}
                  </Link>
                  <Link
                    to="/employer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-slate-700"
                  >
                    {t('dashboard')}
                  </Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 font-bold text-purple-700"
                >
                  Admin Console
                </Link>
              )}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {user.fullName} ({user.role})
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-bold text-red-600"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
