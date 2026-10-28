import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { Crown, Lock, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import LuxuryLogo from '../../components/common/LuxuryLogo';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !code.trim() || !newPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      setResetDone(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not reset password. Check your code.');
    } finally {
      setLoading(false);
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
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '1.25rem' }}>
        <Link
          to="/login"
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
          <ArrowLeft size={16} /> Return to Login
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
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
          borderRadius: '16px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <LuxuryLogo size="md" subtitle="Secure Account Recovery" animated={true} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#F8FAFC', marginBottom: '0.35rem' }}>
            Enter Recovery Code
          </h2>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Set a new password using the 6-digit code sent to your email
          </p>
        </div>

        {resetDone ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
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
              <CheckCircle2 size={32} />
            </div>

            <p style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Password Reset Complete!
            </p>
            <p style={{ color: '#A8B8CC', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
              Your credentials have been securely updated. You can now log into your account.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="toast-banner toast-error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">6-Digit Recovery Code</label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#D6B779',
                  }}
                />
                <input
                  id="code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    letterSpacing: '0.3em',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password (Min 6 Chars)</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#A8B8CC',
                  }}
                />
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.2rem' }}
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

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
