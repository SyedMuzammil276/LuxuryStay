import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { Crown, Mail, ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import LuxuryLogo from '../../components/common/LuxuryLogo';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your account email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await authApi.forgotPassword(email.trim());
      setSentSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not process request. Please try again.');
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
          <ArrowLeft size={16} /> Back to Sign In
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
            <LuxuryLogo size="md" subtitle="Security & Account Recovery" animated={true} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: '#F8FAFC', marginBottom: '0.35rem' }}>
            Reset Password
          </h2>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            We'll email you a 6-digit security code to recover your account
          </p>
        </div>

        {sentSuccess ? (
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

            <p style={{ color: '#F8FAFC', fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Reset Request Sent
            </p>
            <p style={{ color: '#A8B8CC', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
              If an account with <strong>{email}</strong> exists, an email with a 6-digit verification code has been dispatched.
            </p>

            <button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              Enter 6-Digit Code & Reset Password
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

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email">Account Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
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
                  id="email"
                  type="email"
                  required
                  placeholder="name@luxurystay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              {loading ? 'Sending Security Code...' : 'Send Recovery Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
