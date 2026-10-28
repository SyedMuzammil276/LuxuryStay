import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Crown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ArrowLeft,
  User,
  LayoutDashboard,
  LogOut,
  Briefcase,
} from 'lucide-react';
import LuxuryLogo from '../../components/common/LuxuryLogo';

export const LoginPage = () => {
  const { login, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(
    () => localStorage.getItem('luxurystay_remember_email') || ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem('luxurystay_remember_email'))
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Portal tabs: 'admin' | 'staff' | 'guest'
  const [portalTab, setPortalTab] = useState(() => {
    const r = searchParams.get('role');
    if (r === 'guest') return 'guest';
    if (r === 'staff') return 'staff';
    return 'admin';
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);

    if (res.success) {
      if (rememberMe) {
        localStorage.setItem('luxurystay_remember_email', email.trim());
      } else {
        localStorage.removeItem('luxurystay_remember_email');
      }
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  const switchTab = (tab) => {
    setPortalTab(tab);
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#071A31',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundImage: 'radial-gradient(ellipse 70% 55% at 50% 20%, #102B4C 0%, #071A31 100%)',
      }}
    >
      {/* Back to Home */}
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '1.25rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#A8B8CC',
            fontSize: '0.85rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#D6B779'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#A8B8CC'; }}
        >
          <ArrowLeft size={16} /> Return to Hotel Information
        </Link>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          backgroundColor: '#0D2340',
          border: '1px solid #263E59',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(214, 183, 121, 0.08)',
          borderRadius: '16px',
          animation: 'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* === Already Logged In === */}
        {isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'center' }}>
              <LuxuryLogo size="lg" subtitle="Management & Guest Access" animated />
            </div>

            <div
              style={{
                backgroundColor: 'rgba(39, 174, 117, 0.12)',
                border: '1px solid rgba(39, 174, 117, 0.4)',
                borderRadius: '12px',
                padding: '1.35rem 1rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#72E2B0',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="badge-live-dot" /> You Are Already Logged In
              </div>
              <p style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                {user?.name}
              </p>
              <p style={{ color: '#D6B779', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                Active {user?.role} Session
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary btn-shimmer"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', gap: '0.55rem' }}
              >
                <LayoutDashboard size={18} /> Continue to Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem' }}
              >
                Return to Hotel Website
              </button>
              <button
                type="button"
                onClick={logout}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  color: '#FF8F97',
                  borderColor: 'rgba(228, 91, 101, 0.35)',
                  gap: '0.4rem',
                }}
              >
                <LogOut size={14} /> Sign Out to Switch Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Logo & Heading */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <LuxuryLogo size="lg" subtitle="Five-Star HMS & Residences" animated />
              </div>
              <p style={{ color: '#A8B8CC', fontSize: '0.86rem', marginTop: '0.2rem' }}>
                {portalTab === 'admin' && ' Executive Administrator Portal'}
                {portalTab === 'staff' && ' Front Desk & Staff Operations Portal'}
                {portalTab === 'guest' && ' Guest Suite Bookings & Folio Portal'}
              </p>
            </div>

            {/* Portal Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#061529',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                border: '1px solid #263E59',
                gap: '3px',
              }}
            >
              {[
                { key: 'admin', label: 'Admin',  Icon: Crown    },
                { key: 'staff', label: 'Staff',  Icon: Briefcase },
                { key: 'guest', label: 'Guest',  Icon: User     },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTab(key)}
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.35rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: portalTab === key ? '700' : '500',
                    color: portalTab === key ? '#061529' : '#A8B8CC',
                    backgroundColor: portalTab === key ? '#D6B779' : 'transparent',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    boxShadow: portalTab === key ? '0 2px 8px rgba(214, 183, 121, 0.4)' : 'none',
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="toast-banner toast-error" role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">
                  {portalTab === 'admin' && 'Administrator Email'}
                  {portalTab === 'staff' && 'Staff / Employee Email'}
                  {portalTab === 'guest' && 'Guest Email Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#A8B8CC',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder={
                      portalTab === 'admin'
                        ? 'mehaksohail@aptechnorth.edu.pk'
                        : portalTab === 'staff'
                        ? 'staff@luxurystay.com'
                        : 'guest@luxurystay.com'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password">Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.78rem', color: '#D6B779', textDecoration: 'none' }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#A8B8CC',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#A8B8CC',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    color: '#A8B8CC',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#D6B779', cursor: 'pointer' }}
                  />
                  Remember my email
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-shimmer"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', gap: '0.55rem' }}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn size={18} />
                    {portalTab === 'admin' && 'Sign In as Administrator'}
                    {portalTab === 'staff' && 'Sign In to Staff Portal'}
                    {portalTab === 'guest' && 'Sign In to Guest Account'}
                  </>
                )}
              </button>
            </form>

          
         
         
            {portalTab !== 'guest' && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#A8B8CC' }}>
                New guest visiting LuxuryStay?{' '}
                <Link to="/register" style={{ color: '#D6B779', fontWeight: '600' }}>
                  Register Profile
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
