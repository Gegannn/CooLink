import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Search,
  BriefcaseBusiness,
  Bell,
  User as UserIcon,
  PlusSquare,
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show on auth pages or for non-logged-in users on landing page
  const hideOnPaths = ['/login', '/register', '/verify-otp'];
  if (hideOnPaths.some(p => location.pathname.startsWith(p))) return null;
  if (!user) return null;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center space-y-0.5 px-2 py-1 min-w-0 flex-1 transition-colors rounded-xl ${
      isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
    }`;

  const iconClass = (isActive: boolean) =>
    `w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-500'}`;

  const labelClass = 'text-[10px] font-semibold tracking-wide truncate w-full text-center mt-0.5';

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-center px-1 md:hidden"
      style={{
        paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
        minHeight: '56px',
      }}
    >
      {/* WORKER NAV */}
      {user.role === 'WORKER' && (
        <>
          <NavLink to="/worker/dashboard" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <Home className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Home</span>
              </>
            )}
          </NavLink>
          <NavLink to="/worker/requests" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <ClipboardList className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Requests</span>
              </>
            )}
          </NavLink>
          <NavLink to="/worker/messages" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <Bell className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Alerts</span>
              </>
            )}
          </NavLink>
          <NavLink to="/worker/profile" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <UserIcon className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Profile</span>
              </>
            )}
          </NavLink>
        </>
      )}

      {/* EMPLOYER NAV */}
      {user.role === 'EMPLOYER' && (
        <>
          <NavLink to="/employer/workers" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <Search className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Find</span>
              </>
            )}
          </NavLink>
          <NavLink to="/employer/post-job" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <PlusSquare className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Post Job</span>
              </>
            )}
          </NavLink>
          <NavLink to="/employer/dashboard" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <LayoutDashboard className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Jobs</span>
              </>
            )}
          </NavLink>
          <NavLink to="/employer/messages" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <Bell className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Alerts</span>
              </>
            )}
          </NavLink>
        </>
      )}

      {/* ADMIN NAV */}
      {user.role === 'ADMIN' && (
        <>
          <NavLink to="/" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <Home className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Home</span>
              </>
            )}
          </NavLink>
          <NavLink to="/admin" className={navItemClass}>
            {({ isActive: a }) => (
              <>
                <ShieldCheck className={iconClass(a)} strokeWidth={a ? 2.5 : 2} />
                <span className={labelClass} style={{ color: a ? '#2563eb' : undefined }}>Admin</span>
              </>
            )}
          </NavLink>
        </>
      )}
    </nav>
  );
};
