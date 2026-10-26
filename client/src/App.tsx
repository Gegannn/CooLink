import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerProfilePage } from './pages/worker/WorkerProfilePage';
import { WorkerRequestsPage } from './pages/worker/WorkerRequestsPage';

// Employer Pages
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { WorkerDiscoveryPage } from './pages/employer/WorkerDiscoveryPage';
import { PostJobPage } from './pages/employer/PostJobPage';

// Shared & Admin Pages
import { MessagesPage } from './pages/MessagesPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* Worker Routes */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/profile"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <WorkerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/requests"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <WorkerRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/messages"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Employer Routes */}
          <Route path="/employer/workers" element={<WorkerDiscoveryPage />} />
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                <PostJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/messages"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER', 'ADMIN']}>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
