import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/common/LoadingScreen';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Authenticated Application Modules
import DashboardPage from './pages/dashboard/DashboardPage';
import StaffManagementPage from './pages/users/StaffManagementPage';
import GuestManagementPage from './pages/guests/GuestManagementPage';
import RoomManagementPage from './pages/rooms/RoomManagementPage';
import ReservationManagementPage from './pages/reservations/ReservationManagementPage';
import OperationsPage from './pages/operations/OperationsPage';
import BillingPage from './pages/billing/BillingPage';
import HousekeepingPage from './pages/housekeeping/HousekeepingPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';
import GuestServicesPage from './pages/services/GuestServicesPage';
import FeedbackPage from './pages/feedback/FeedbackPage';
import ReportsPage from './pages/reports/ReportsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/profile/ProfilePage';

/** Scrolls to top on every route change */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

/** Page-level fade transition wrapper */
const PageWrapper = ({ children }) => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {children}
    </div>
  );
};

/** App shell – shown after initial loading screen */
const AppShell = () => (
  <Router>
    <ScrollToTop />
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
      <Route path="/info" element={<PageWrapper><LandingPage /></PageWrapper>} />

      {/* Auth Routes */}
      <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
      <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
      <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
      <Route path="/reset-password" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />

      {/* Protected Application Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Staff (Admin only) */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Guests (Front desk) */}
        <Route
          path="/guests"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist']}>
              <GuestManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Rooms – all authenticated roles */}
        <Route path="/rooms" element={<RoomManagementPage />} />

        {/* Reservations */}
        <Route
          path="/reservations"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'guest']}>
              <ReservationManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Check-in / Check-out */}
        <Route
          path="/operations"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist']}>
              <OperationsPage />
            </ProtectedRoute>
          }
        />

        {/* Billing */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'guest']}>
              <BillingPage />
            </ProtectedRoute>
          }
        />

        {/* Housekeeping */}
        <Route
          path="/housekeeping"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'housekeeping']}>
              <HousekeepingPage />
            </ProtectedRoute>
          }
        />

        {/* Maintenance */}
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'maintenance']}>
              <MaintenancePage />
            </ProtectedRoute>
          }
        />

        {/* Guest Services */}
        <Route
          path="/guest-services"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'receptionist', 'housekeeping', 'guest']}>
              <GuestServicesPage />
            </ProtectedRoute>
          }
        />

        {/* Guests submit feedback; admins and managers review it */}
        <Route
          path="/feedback"
          element={
            <ProtectedRoute allowedRoles={['guest', 'admin', 'manager']}>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Notifications – all */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Profile – all */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

/** Root component with initial loading gate */
export function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate minimum splash time so assets load before revealing app
    const t = setTimeout(() => setAppReady(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        {!appReady && <LoadingScreen message="Preparing Your Experience" />}
        <div
          style={{
            opacity: appReady ? 1 : 0,
            transition: 'opacity 0.5s ease',
            visibility: appReady ? 'visible' : 'hidden',
          }}
        >
          <AppShell />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
