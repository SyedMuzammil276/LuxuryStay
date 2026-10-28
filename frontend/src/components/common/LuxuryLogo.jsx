import React from 'react';

/**
 * LuxuryStay – Clean, elegant hotel logo mark.
 * Crown icon with gold gradient + brand typography.
 * Sizes: 'sm' | 'md' | 'lg' | 'xl'
 */
export const LuxuryLogo = ({
  size = 'md',
  showText = true,
  subtitle = 'Hotel & Resort',
  animated = true,
  className = '',
  style = {},
  onClick,
}) => {
  const dims = {
    sm: { icon: 30, title: '1rem', sub: '0.55rem', gap: '0.55rem' },
    md: { icon: 40, title: '1.25rem', sub: '0.62rem', gap: '0.7rem' },
    lg: { icon: 52, title: '1.55rem', sub: '0.7rem', gap: '0.8rem' },
    xl: { icon: 66, title: '1.9rem', sub: '0.78rem', gap: '0.95rem' },
  }[size] ?? { icon: 40, title: '1.25rem', sub: '0.62rem', gap: '0.7rem' };

  return (
    <div
      onClick={onClick}
      className={`luxury-logo-wrapper${animated ? ' luxury-logo-animated' : ''}${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.gap,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none',
        ...style,
      }}
    >
      {/* Crown Emblem */}
      <div
        className="luxury-crest-box"
        style={{
          width: dims.icon,
          height: dims.icon,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(214, 183, 121, 0.45))', overflow: 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lsG1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E7" />
              <stop offset="45%" stopColor="#D6B779" />
              <stop offset="100%" stopColor="#A8823B" />
            </linearGradient>
            <linearGradient id="lsG2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D6B779" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Top accent stars */}
          <polygon
            points="50,5 51.4,9 55,9.4 52.5,11.7 53.3,15.3 50,13.5 46.7,15.3 47.5,11.7 45,9.4 48.6,9"
            fill="url(#lsG1)"
          />
          <circle cx="35" cy="11" r="2" fill="url(#lsG1)" opacity="0.8" />
          <circle cx="65" cy="11" r="2" fill="url(#lsG1)" opacity="0.8" />

          {/* Crown body */}
          <path
            d="M 17,38 L 25,63 L 75,63 L 83,38 L 65,49 L 50,23 L 35,49 Z"
            fill="url(#lsG1)"
          />

          {/* Highlight shading */}
          <path d="M 50,23 L 35,49 L 50,57 L 65,49 Z" fill="url(#lsG2)" opacity="0.35" />

          {/* Centre diamond */}
          <g transform="translate(50,49)">
            <polygon
              points="0,-10 2.8,-3 10,0 2.8,3 0,10 -2.8,3 -10,0 -2.8,-3"
              fill="#FFFFFF"
              opacity="0.92"
            />
            <circle cx="0" cy="0" r="2" fill="#FFF8E7" />
          </g>

          {/* Base band */}
          <rect x="23" y="65" width="54" height="6" rx="2" fill="url(#lsG1)" />
          {/* Small jewel accents on band */}
          <rect x="33" y="66.5" width="4" height="2.5" rx="1" fill="#071A31" />
          <rect x="47" y="66" width="6" height="3.5" rx="1" fill="#FFFFFF" />
          <rect x="63" y="66.5" width="4" height="2.5" rx="1" fill="#071A31" />

          {/* Laurel curves */}
          <path d="M 19,65 C 17,77 27,86 43,90" stroke="url(#lsG1)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M 81,65 C 83,77 73,86 57,90" stroke="url(#lsG1)" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85" />
          <circle cx="50" cy="90" r="2" fill="#D6B779" opacity="0.9" />
        </svg>
      </div>

      {/* Brand text */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span
              className="luxury-brand-name"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: dims.title,
                fontWeight: '700',
                color: '#F8FAFC',
                letterSpacing: '0.05em',
                lineHeight: 1.1,
              }}
            >
              LuxuryStay
            </span>
            {/* Gold accent dot */}
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFF8E7 0%, #D6B779 100%)',
                boxShadow: '0 0 6px rgba(214, 183, 121, 0.85)',
                flexShrink: 0,
                marginBottom: '2px',
              }}
            />
          </div>

          <span
            className="luxury-brand-sub"
            style={{
              fontSize: dims.sub,
              letterSpacing: '0.22em',
              color: '#D6B779',
              textTransform: 'uppercase',
              fontWeight: '600',
              marginTop: '0.25rem',
            }}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default LuxuryLogo;
