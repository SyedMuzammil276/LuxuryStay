import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { guestsApi } from '../../api/endpoints';
import {
  Crown,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import LuxuryLogo from '../../components/common/LuxuryLogo';

export const RegisterPage = () => {
  const { registerGuest, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    nationality: '',
    identificationType: 'passport',
    identificationNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg('First Name and Last Name are required.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMsg('A valid email address is required.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long as required by hotel security.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...payload } = formData;
    const res = await registerGuest(payload);

    if (res.success) {
      setSuccessInfo({
        email: formData.email.trim(),
        message: res.message,
      });
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!successInfo?.email) return;
    setResending(true);
    setResendMsg('');
    try {
      const res = await guestsApi.resendVerificationPublic(successInfo.email);
      setResendMsg(res.data?.message || 'Verification link resent to your email.');
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Could not resend email.');
    } finally {
      setResending(false);
    }
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
        padding: '2rem 1.5rem',
        backgroundImage: 'radial-gradient(circle at 50% 15%, #102B4C 0%, #071A31 80%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '640px', marginBottom: '1.25rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#A8B8CC',
            fontSize: '0.85rem',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#D6B779')}
          onMouseLeave={(e) => (e.target.style.color = '#A8B8CC')}
        >
          <ArrowLeft size={16} /> Return to Hotel Information
        </Link>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '640px',
          padding: '2.5rem 2rem',
          backgroundColor: '#0D2340',
          border: '1px solid #263E59',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
          borderRadius: '16px',
        }}
      >
        {/* Active Session Notice if User is Already Registered and Logged In */}
        {isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'center' }}>
              <LuxuryLogo size="lg" subtitle="Guest Registration & Concierge" animated={true} />
            </div>

            <div
              style={{
                backgroundColor: 'rgba(39, 174, 117, 0.12)',
                border: '1px solid rgba(39, 174, 117, 0.4)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.75rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
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
                <span className="badge-live-dot" /> You Are Already Registered & Logged In
              </div>
              <p style={{ color: '#F8FAFC', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                {user?.name}
              </p>
              <p
                style={{
                  color: '#D6B779',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: '600',
                }}
              >
                Active {user?.role} Session
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px', margin: '0 auto' }}>
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
                <LogOut size={14} /> Sign Out to Register a New Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <LuxuryLogo size="lg" subtitle="Guest Registration & Concierge" animated={true} />
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.8rem',
                  color: '#F8FAFC',
                  fontWeight: '700',
                  marginBottom: '0.35rem',
                }}
              >
                Create Guest Account
              </h2>
              <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
                Register to unlock bespoke reservations, luxury dining, and valet services
              </p>
            </div>

        {/* Success Modal / State */}
        {successInfo ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(39, 174, 117, 0.15)',
                border: '2px solid #27AE75',
                color: '#27AE75',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#F8FAFC', marginBottom: '0.5rem' }}>
              Registration Submitted!
            </h3>
            <p style={{ color: '#A8B8CC', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              We have generated your guest profile for <strong>{successInfo.email}</strong>.
              <br />
              Please check your inbox to complete verification before logging in.
            </p>

            {resendMsg && (
              <div className="toast-banner toast-info" style={{ justifyContent: 'center' }}>
                <span>{resendMsg}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="btn btn-secondary"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <Link to="/login" className="btn btn-primary">
                Proceed to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="toast-banner toast-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Alexander"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Vance"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="guest@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password (Min 8 Chars) *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: '2.2rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Address & Nationality */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Address / City</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Clifton Block 4, Karachi"
                    value={formData.address}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    placeholder="Pakistani"
                    value={formData.nationality}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Identification */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="identificationType">ID Document Type</label>
                <select
                  id="identificationType"
                  name="identificationType"
                  value={formData.identificationType}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National CNIC / ID Card</option>
                  <option value="driving_license">Driving License</option>
                  <option value="other">Other Official Document</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="identificationNumber">ID / Passport Number</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
                  <input
                    id="identificationNumber"
                    name="identificationNumber"
                    type="text"
                    placeholder="e.g. PK-49204910"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    style={{ width: '100%', paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Creating Guest Account...' : 'Complete Guest Registration'}
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#A8B8CC' }}>
              Already registered at LuxuryStay?{' '}
              <Link to="/login" style={{ color: '#D6B779', fontWeight: '600' }}>
                Sign In to Account
              </Link>
            </div>
          </form>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
