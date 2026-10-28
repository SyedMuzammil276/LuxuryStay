import React, { useEffect, useState } from 'react';

/**
 * LuxuryStay – Full-page loading screen
 * Shown on initial app load / route transitions
 */
export const LoadingScreen = ({ message = 'Preparing Your Experience...' }) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(progressTimer); return 90; }
        return p + Math.random() * 18;
      });
    }, 220);

    const dotsTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 450);

    return () => {
      clearInterval(progressTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#071A31',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(16, 43, 76, 0.9) 0%, #071A31 100%)',
        pointerEvents: 'none',
      }} />

      {/* Ambient particle dots */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${4 + i * 2}px`,
          height: `${4 + i * 2}px`,
          borderRadius: '50%',
          background: 'rgba(214, 183, 121, 0.25)',
          top: `${10 + i * 14}%`,
          left: `${5 + i * 16}%`,
          animation: `floatGentle ${3 + i * 0.7}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }} />
      ))}

      {/* Logo Mark */}
      <div style={{
        position: 'relative',
        marginBottom: '2rem',
        animation: 'loadLogoIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        <svg
          viewBox="0 0 100 100"
          width="72"
          height="72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 0 20px rgba(214, 183, 121, 0.5))' }}
        >
          <defs>
            <linearGradient id="loadGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E7" />
              <stop offset="40%" stopColor="#D6B779" />
              <stop offset="100%" stopColor="#A8823B" />
            </linearGradient>
          </defs>
          {/* Crown */}
          <path
            d="M 16,38 L 24,62 L 76,62 L 84,38 L 65,48 L 50,22 L 35,48 Z"
            fill="url(#loadGold)"
            strokeWidth="0.6"
          />
          <path d="M 50,22 L 35,48 L 50,56 L 65,48 Z" fill="#FFF8E7" opacity="0.3" />
          {/* Diamond star */}
          <g transform="translate(50, 48)">
            <polygon
              points="0,-10 2.8,-3 10,0 2.8,3 0,10 -2.8,3 -10,0 -2.8,-3"
              fill="#FFFFFF"
            />
          </g>
          {/* Base band */}
          <rect x="22" y="64" width="56" height="6.5" rx="2.5" fill="url(#loadGold)" />
          {/* Stars */}
          <polygon points="50,6 51.5,9.5 55,9.8 52.3,12 53.2,15.5 50,13.6 46.8,15.5 47.7,12 45,9.8 48.5,9.5" fill="url(#loadGold)" />
          <circle cx="36" cy="12" r="2" fill="url(#loadGold)" opacity="0.85" />
          <circle cx="64" cy="12" r="2" fill="url(#loadGold)" opacity="0.85" />
        </svg>

        {/* Rotating ring */}
        <div style={{
          position: 'absolute',
          inset: '-12px',
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#D6B779',
          borderRightColor: 'rgba(214, 183, 121, 0.4)',
          animation: 'spin 1.2s linear infinite',
        }} />
      </div>

      {/* Brand Name */}
      <div style={{
        animation: 'loadFadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        textAlign: 'center',
        marginBottom: '0.35rem',
      }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#F8FAFC',
          letterSpacing: '0.06em',
        }}>
          LuxuryStay
        </span>
        <span style={{
          display: 'inline-block',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFF8E7 0%, #D6B779 100%)',
          boxShadow: '0 0 10px rgba(214, 183, 121, 0.9)',
          marginLeft: '3px',
          marginBottom: '3px',
        }} />
      </div>

      <div style={{
        animation: 'loadFadeUp 0.8s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        fontSize: '0.62rem',
        letterSpacing: '0.28em',
        color: '#D6B779',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: '2.5rem',
      }}>
        Hospitality HMS
      </div>

      {/* Progress Bar */}
      <div style={{
        animation: 'loadFadeUp 0.8s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        width: '220px',
        marginBottom: '1.25rem',
      }}>
        <div style={{
          height: '3px',
          backgroundColor: 'rgba(38, 62, 89, 0.8)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(progress, 95)}%`,
            background: 'linear-gradient(90deg, #A8823B 0%, #D6B779 50%, #FFF8E7 100%)',
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 8px rgba(214, 183, 121, 0.6)',
          }} />
        </div>
      </div>

      {/* Message */}
      <p style={{
        animation: 'loadFadeUp 0.8s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        fontSize: '0.78rem',
        color: '#A8B8CC',
        letterSpacing: '0.08em',
        textAlign: 'center',
      }}>
        {message}{dots}
      </p>

      <style>{`
        @keyframes loadLogoIn {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes loadFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
