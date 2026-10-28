import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show luxury loading screen while verifying session
  if (isLoading) {
    return <LoadingScreen message="Verifying Your Access" />;
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          animation: 'fadeIn 0.4s ease',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '500px',
            textAlign: 'center',
            padding: '3rem 2.5rem',
            border: '1px solid var(--danger-border)',
          }}
        >
          <ShieldAlert size={56} style={{ color: 'var(--danger)', marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Your account role (<strong style={{ color: 'var(--gold)' }}>{user?.role}</strong>) does
            not have permission to access this area.
          </p>
          <a href="/dashboard" className="btn btn-primary btn-shimmer" style={{ padding: '0.75rem 2rem' }}>
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
