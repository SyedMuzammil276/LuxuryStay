import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import LuxuryLogo from '../../components/common/LuxuryLogo';
import {
  BedDouble,
  Utensils,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Star,
  Users,
  Calendar,
  ArrowRight,
  Coffee,
  Wifi,
  Waves,
  Car,
  CheckCircle2,
  Lock,
  LayoutDashboard,
  LogOut,
  Award,
  Gem,
  ExternalLink,
  Clock,
  Wine,
  Crown,
  Shield,
} from 'lucide-react';

export const LandingPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res = await roomsApi.listPublicRooms({ limit: 12 });
        if (res.data?.rooms && res.data.rooms.length > 0) {
          setRooms(res.data.rooms);
        } else {
          setRooms([]);
        }
      } catch (err) {
        console.warn('Could not fetch public rooms:', err.message);
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Filter rooms based on active category
  const filteredRooms = rooms.filter((r) => {
    if (activeCategory === 'all') return true;
    const type = (r.roomType || '').toLowerCase();
    if (activeCategory === 'presidential') return type.includes('presidential') || type.includes('penthouse');
    if (activeCategory === 'suite') return type.includes('suite');
    if (activeCategory === 'deluxe') return type.includes('deluxe') || type.includes('standard') || type.includes('executive');
    return true;
  });

  // Accolades for the infinite marquee ribbon
  const marqueeAccolades = [
    '★ Michelin-Star Dining & Sky Lounge',
    '★ 24/7 Bespoke Royal Concierge',
    '★ Heated Panoramic Infinity Pool & Spa',
    '★ Forbes 5-Star Hospitality Standard',
    '★ Presidential & Royal Ocean Suites',
    '★ Private Helicopter Valet & Chauffeur',
    '★ High-Speed Fiber & Smart Suites',
    '★ Condé Nast Gold List 2026 Honor',
  ];

  return (
    <div style={{ backgroundColor: '#071A31', color: '#F8FAFC', minHeight: '100vh', overflowX: 'clip', position: 'relative' }}>
      {/* Luxury Top Bar */}
      <div
        style={{
          backgroundColor: '#061529',
          borderBottom: '1px solid #263E59',
          padding: '0.5rem 2rem',
          fontSize: '0.8rem',
          color: '#A8B8CC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={13} style={{ color: '#D6B779' }} /> Royal Avenue, Suite 100, Karachi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Phone size={13} style={{ color: '#D6B779' }} /> +92 (21) 111-LUXURY (589-879)
          </span>
        </div>

        {/* Dynamic Top Bar: Logged-in recognition vs Guest view */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#F8FAFC' }}>
                <span className="badge-live-dot" />
                <span>
                  Signed in as <strong style={{ color: '#D6B779' }}>{user?.name}</strong>{' '}
                  <span style={{ color: '#A8B8CC', fontSize: '0.74rem', textTransform: 'capitalize' }}>
                    ({user?.role})
                  </span>
                </span>
              </div>
              <Link
                to="/dashboard"
                style={{
                  color: '#D6B779',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  transition: 'color 0.2s',
                }}
              >
                <LayoutDashboard size={13} /> Return to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  color: '#FF8F97',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          ) : (
            <>
              <span style={{ color: '#D6B779', fontWeight: '600' }}>★ 5-Star International Hospitality</span>
              <Link
                to="/login?role=admin"
                style={{
                  color: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#D6B779')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#F8FAFC')}
              >
                <Lock size={12} style={{ color: '#D6B779' }} /> Staff / Admin
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Public Navigation Header - 100% Reliable Sticky Navbar */}
      <nav
        style={{
          height: isScrolled ? '72px' : '82px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isScrolled
            ? '1px solid rgba(214, 183, 121, 0.35)'
            : '1px solid rgba(214, 183, 121, 0.18)',
          backgroundColor: isScrolled
            ? 'rgba(4, 15, 29, 0.96)'
            : 'rgba(7, 26, 49, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: isScrolled
            ? '0 8px 30px rgba(0, 0, 0, 0.65), 0 0 16px rgba(214, 183, 121, 0.15)'
            : '0 4px 20px rgba(0, 0, 0, 0.35)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Bespoke Royal Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <LuxuryLogo size="md" subtitle="Hotel & Resort" animated={true} />
        </Link>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href="#rooms"
            style={{
              color: '#A8B8CC',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.2s',
              padding: '0.5rem 0.75rem',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#D6B779')}
            onMouseLeave={(e) => (e.target.style.color = '#A8B8CC')}
          >
            Suites & Rooms
          </a>
          <a
            href="#amenities"
            style={{
              color: '#A8B8CC',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.2s',
              padding: '0.5rem 0.75rem',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#D6B779')}
            onMouseLeave={(e) => (e.target.style.color = '#A8B8CC')}
          >
            Services & Spa
          </a>
          <a
            href="#dining"
            style={{
              color: '#A8B8CC',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.2s',
              padding: '0.5rem 0.75rem',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#D6B779')}
            onMouseLeave={(e) => (e.target.style.color = '#A8B8CC')}
          >
            Dining
          </a>
          <a
            href="#contact"
            style={{
              color: '#A8B8CC',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'color 0.2s',
              padding: '0.5rem 0.75rem',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#D6B779')}
            onMouseLeave={(e) => (e.target.style.color = '#A8B8CC')}
          >
            Location
          </a>
        </div>

        {/* Authentication State Controls: Always shows logged in state if user already logged in! */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Luxury User Profile Badge */}
              <div
                onClick={() => navigate('/dashboard')}
                title="View your dashboard session"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.35rem 0.85rem 0.35rem 0.4rem',
                  backgroundColor: 'rgba(13, 35, 64, 0.9)',
                  border: '1px solid rgba(214, 183, 121, 0.35)',
                  borderRadius: '28px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D6B779';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(214, 183, 121, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(214, 183, 121, 0.35)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
                }}
              >
                {/* Avatar with Status Dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFF8E7 0%, #D6B779 50%, #A8823B 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#061529',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      boxShadow: '0 2px 8px rgba(214, 183, 121, 0.4)',
                    }}
                  >
                    {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: '#27AE75',
                      border: '1.5px solid #071A31',
                      boxShadow: '0 0 6px #27AE75',
                    }}
                  />
                </div>

                {/* Name & Role Tag */}
                <div style={{ textAlign: 'left', lineHeight: '1.15' }}>
                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      color: '#F8FAFC',
                      display: 'block',
                      textTransform: 'capitalize',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {user?.name?.trim().split(' ')[0] || 'User'}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '1px 7px',
                      borderRadius: '8px',
                      fontSize: '0.62rem',
                      fontWeight: '700',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginTop: '0.15rem',
                      backgroundColor:
                        user?.role === 'admin'
                          ? 'rgba(214, 183, 121, 0.2)'
                          : user?.role === 'guest'
                          ? 'rgba(85, 167, 232, 0.2)'
                          : 'rgba(39, 174, 117, 0.2)',
                      color:
                        user?.role === 'admin'
                          ? '#D6B779'
                          : user?.role === 'guest'
                          ? '#92CDFF'
                          : '#72E2B0',
                      border:
                        user?.role === 'admin'
                          ? '1px solid rgba(214, 183, 121, 0.45)'
                          : user?.role === 'guest'
                          ? '1px solid rgba(85, 167, 232, 0.45)'
                          : '1px solid rgba(39, 174, 117, 0.45)',
                    }}
                  >
                    {user?.role === 'admin' && <Crown size={9} />}
                    {user?.role === 'guest' && <Sparkles size={9} />}
                    {user?.role !== 'admin' && user?.role !== 'guest' && <Shield size={9} />}
                    {user?.role || 'Guest'}
                  </span>
                </div>
              </div>

              {/* Enter Dashboard Primary CTA */}
              <Link
                to="/dashboard"
                className="btn btn-primary btn-shimmer"
                style={{ fontSize: '0.88rem', padding: '0.6rem 1.25rem', gap: '0.5rem' }}
              >
                <LayoutDashboard size={16} /> Enter Dashboard
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                title="Sign out of current account"
                style={{
                  fontSize: '0.82rem',
                  padding: '0.6rem 0.9rem',
                  color: '#FF8F97',
                  borderColor: 'rgba(228, 91, 101, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-shimmer" style={{ fontSize: '0.85rem' }}>
                Register as Guest
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Rich Ambient Animations & Floating Badges */}
      <section
        style={{
          position: 'relative',
          padding: '6.5rem 2rem 5.5rem',
          backgroundImage:
            'linear-gradient(180deg, rgba(7,26,49,0.72) 0%, rgba(7,26,49,0.92) 100%), url(/images/hotel_hero_lobby.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid #263E59',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Floating Accolade Badge 1 - Top Right */}
        <div
          className="anim-float glass-luxury-panel desktop-only"
          style={{
            position: 'absolute',
            top: '12%',
            right: '4%',
            padding: '0.65rem 1.2rem',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 10,
          }}
        >
          <Award size={18} style={{ color: '#D6B779' }} />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <span style={{ fontSize: '0.78rem', color: '#F8FAFC', fontWeight: '700', display: 'block' }}>
              Forbes Travel Guide 2026
            </span>
            <span style={{ fontSize: '0.68rem', color: '#D6B779' }}>Recommended Luxury Resort</span>
          </div>
        </div>

        {/* Floating Accolade Badge 2 - Bottom Left */}
        <div
          className="anim-float-reverse glass-luxury-panel desktop-only"
          style={{
            position: 'absolute',
            bottom: '18%',
            left: '4%',
            padding: '0.65rem 1.2rem',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 10,
          }}
        >
          <Gem size={18} style={{ color: '#D6B779' }} />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <span style={{ fontSize: '0.78rem', color: '#F8FAFC', fontWeight: '700', display: 'block' }}>
              99.8% Guest Satisfaction
            </span>
            <span style={{ fontSize: '0.68rem', color: '#72E2B0' }}>Verified 5-Star Experience</span>
          </div>
        </div>

        <div style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
          {/* Top Tag: Dynamic if Authenticated */}
          {isAuthenticated ? (
            <div
              className="anim-slide-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                backgroundColor: 'rgba(39, 174, 117, 0.15)',
                border: '1px solid rgba(39, 174, 117, 0.45)',
                borderRadius: '30px',
                padding: '0.4rem 1.25rem',
                fontSize: '0.84rem',
                color: '#72E2B0',
                fontWeight: '600',
                marginBottom: '1.5rem',
                boxShadow: '0 0 15px rgba(39, 174, 117, 0.25)',
              }}
            >
              <span className="badge-live-dot" />
              <span>Welcome back, {user?.name}! Your Royal Session is Active</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(214, 183, 121, 0.12)',
                border: '1px solid rgba(214, 183, 121, 0.35)',
                borderRadius: '30px',
                padding: '0.4rem 1.25rem',
                fontSize: '0.82rem',
                color: '#D6B779',
                fontWeight: '600',
                marginBottom: '1.5rem',
                letterSpacing: '0.05em',
                boxShadow: '0 0 15px rgba(214, 183, 121, 0.15)',
              }}
            >
              <Sparkles size={15} /> FIVE-STAR WORLD CLASS HOSPITALITY
            </div>
          )}

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              fontWeight: '700',
              color: '#F8FAFC',
              lineHeight: '1.14',
              marginBottom: '1.35rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}
          >
            Experience Unrivaled Opulence & Grandeur
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#C4D4E8',
              maxWidth: '720px',
              margin: '0 auto 2.75rem',
              lineHeight: '1.65',
              fontWeight: '300',
            }}
          >
            Immerse yourself in timeless luxury, bespoke royal suites, Michelin-star dining,
            and flawless hotel hospitality orchestrated by an intelligent modern management platform.
          </p>

          {/* Dynamic Hero Buttons: Direct access if already logged in */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.1rem',
              flexWrap: 'wrap',
            }}
          >
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg btn-shimmer" style={{ gap: '0.6rem' }}>
                  <LayoutDashboard size={18} /> Enter Dashboard <ArrowRight size={18} />
                </Link>
                <Link to="/reservations" className="btn btn-secondary btn-lg" style={{ gap: '0.5rem' }}>
                  <Calendar size={18} /> My Bookings
                </Link>
                <a href="#rooms" className="btn btn-outline btn-lg">
                  Explore Suites
                </a>
              </>
            ) : (
              <>
                <a href="#rooms" className="btn btn-primary btn-lg btn-shimmer">
                  Explore Available Rooms <ChevronRight size={18} />
                </a>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Create Guest Account
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Staff / Admin Portal
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Highlights Counter */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '4.8rem auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.5rem',
            position: 'relative',
            zIndex: 5,
          }}
        >
          {[
            { label: 'Curated Accommodations', value: rooms.length > 0 ? `${rooms.length} Suites` : 'Live Inventory' },
            { label: 'Hospitality Rating', value: '5-Star Standard' },
            { label: 'Royal Concierge Desk', value: '24 / 7 Live' },
            { label: 'Security & Privacy', value: 'Encrypted & VIP' },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-luxury-panel card-luxury-hover"
              style={{
                borderRadius: '14px',
                padding: '1.6rem 1.2rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.85rem',
                  fontWeight: '700',
                  color: '#D6B779',
                  marginBottom: '0.3rem',
                  textShadow: '0 0 12px rgba(214, 183, 121, 0.4)',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#A8B8CC', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Infinite Accolades Marquee Banner */}
      <div
        style={{
          backgroundColor: '#051120',
          borderTop: '1px solid rgba(214, 183, 121, 0.25)',
          borderBottom: '1px solid rgba(214, 183, 121, 0.25)',
          padding: '0.95rem 0',
          overflow: 'hidden',
          position: 'relative',
          whiteSpace: 'nowrap',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        <div className="marquee-track" style={{ display: 'flex', gap: '3.5rem', alignItems: 'center' }}>
          {[...marqueeAccolades, ...marqueeAccolades].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#D6B779',
                fontSize: '0.84rem',
                letterSpacing: '0.12em',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={13} style={{ color: '#FFF1D0' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Suites & Accommodations Section */}
      <section id="rooms" style={{ padding: '5.5rem 2rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              fontSize: '0.82rem',
              letterSpacing: '0.18em',
              color: '#D6B779',
              textTransform: 'uppercase',
              fontWeight: '700',
            }}
          >
            Curated Accommodations
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.6rem',
              color: '#F8FAFC',
              marginTop: '0.5rem',
            }}
          >
            Luxurious Rooms & Signature Suites
          </h2>
          <p style={{ color: '#A8B8CC', maxWidth: '620px', margin: '0.6rem auto 0', fontSize: '0.95rem' }}>
            Every suite is carefully crafted with premium comforts, plush bedding, and modern automated amenities.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          {[
            { id: 'all', label: 'All Accommodations' },
            { id: 'deluxe', label: 'Executive Deluxe' },
            { id: 'suite', label: 'Royal Suites' },
            { id: 'presidential', label: 'Presidential Penthouse' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '30px',
                fontSize: '0.86rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                backgroundColor: activeCategory === cat.id ? '#D6B779' : '#0D2340',
                color: activeCategory === cat.id ? '#061529' : '#A8B8CC',
                border: activeCategory === cat.id ? '1px solid #D6B779' : '1px solid #263E59',
                boxShadow:
                  activeCategory === cat.id ? '0 4px 14px rgba(214, 183, 121, 0.4)' : 'none',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loadingRooms ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#D6B779' }}>
            <p style={{ fontSize: '1.1rem' }}>Loading premier accommodations from hotel database...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#0D2340',
              borderRadius: '14px',
              border: '1px solid #263E59',
            }}
          >
            <BedDouble size={48} style={{ color: '#D6B779', margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ color: '#F8FAFC', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              No Rooms Matching Selected Category
            </h3>
            <p style={{ color: '#A8B8CC', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              We are constantly tailoring suite allocations. Try selecting "All Accommodations" to view available inventory.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="btn btn-outline"
              style={{ color: '#D6B779', borderColor: '#D6B779' }}
            >
              View All Rooms
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '2.25rem',
            }}
          >
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="card card-luxury-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: 0,
                  border: '1px solid #263E59',
                  borderRadius: '16px',
                  backgroundColor: '#0D2340',
                }}
              >
                {/* Room Card Visual Header */}
                <div
                  style={{
                    height: '210px',
                    backgroundImage: (() => {
                      const t = (room.roomType || '').toLowerCase();
                      if (t.includes('suite') || t.includes('presidential'))
                        return 'linear-gradient(rgba(7,26,49,0.3), rgba(7,26,49,0.7)), url(/images/hotel_suite_living.jpg)';
                      return 'linear-gradient(rgba(7,26,49,0.25), rgba(7,26,49,0.65)), url(/images/hotel_deluxe_room.jpg)';
                    })(),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'rgba(6, 21, 41, 0.85)',
                        color: '#D6B779',
                        padding: '0.3rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        letterSpacing: '0.04em',
                        border: '1px solid rgba(214, 183, 121, 0.3)',
                      }}
                    >
                      ROOM #{room.roomNumber}
                    </span>
                    <span className={`badge badge-${(room.status || 'available').toLowerCase()}`}>
                      {room.status || 'Available'}
                    </span>
                  </div>

                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        color: '#F8FAFC',
                        textTransform: 'capitalize',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {typeof room.roomType === 'string' && room.roomType.length < 20
                        ? room.roomType
                        : 'Executive Deluxe'}{' '}
                      Suite
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#C4D4E8',
                        fontSize: '0.82rem',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={14} /> Sleeps {room.capacity || 2}
                      </span>
                      <span>•</span>
                      <span>Floor {room.floor || 1}</span>
                      <span>•</span>
                      <span>City Panorama</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ color: '#A8B8CC', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {room.description ||
                      'Experience bespoke hospitality, king-size orthopedic bedding, marble bath, and tailored concierge support.'}
                  </p>

                  {/* Amenities Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem' }}>
                    {(Array.isArray(room.amenities) && room.amenities.length > 0
                      ? room.amenities
                      : ['Wi-Fi', '24/7 Dining', 'Smart TV', 'Mini Bar']
                    )
                      .slice(0, 4)
                      .map((amenity, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#143253',
                            color: '#F8FAFC',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid #263E59',
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                  </div>

                  {/* Pricing and Action Button: If user logged in, goes straight to reservation! */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #263E59',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#A8B8CC', display: 'block' }}>Per Night</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: '700', color: '#D6B779' }}>
                        ${room.pricePerNight || room.price || 250}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          // Directly take the authenticated user to make a reservation with pre-selected room!
                          navigate(
                            `/reservations?roomId=${room._id}&roomType=${encodeURIComponent(
                              room.roomType || ''
                            )}`
                          );
                        } else {
                          navigate('/login?redirect=reservations');
                        }
                      }}
                      className="btn btn-primary btn-shimmer"
                      style={{ fontSize: '0.88rem', padding: '0.6rem 1.15rem' }}
                    >
                      {isAuthenticated ? 'Book Suite' : 'Reserve Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* World-Class Hotel Amenities Section */}
      <section
        id="amenities"
        style={{
          padding: '5.5rem 2rem',
          backgroundColor: '#061529',
          borderTop: '1px solid #263E59',
          borderBottom: '1px solid #263E59',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.82rem',
                letterSpacing: '0.18em',
                color: '#D6B779',
                textTransform: 'uppercase',
                fontWeight: '700',
              }}
            >
              Unrivaled Privileges
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.5rem',
                color: '#F8FAFC',
                marginTop: '0.5rem',
              }}
            >
              World-Class Amenities & Privileges
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1.85rem',
            }}
          >
            {[
              {
                icon: Utensils,
                title: 'Michelin Dining & Lounge',
                desc: 'Exquisite culinary masterpieces crafted by international chefs, available 24 hours in-suite or at our rooftop terrace.',
              },
              {
                icon: Waves,
                title: 'Serenity Spa & Infinity Pool',
                desc: 'Recharge your mind and spirit with therapeutic steam rooms, herbal hot tubs, and panoramic heated infinity pools.',
              },
              {
                icon: Car,
                title: 'Executive Chauffeur Service',
                desc: 'Luxury airport transfers and city tours in high-end luxury vehicles accompanied by certified professional chauffeurs.',
              },
              {
                icon: Sparkles,
                title: '24/7 Royal Housekeeping',
                desc: 'Impeccable cleanliness, linen replacement, and personalized turn-down service monitored live via our HMS.',
              },
              {
                icon: Wifi,
                title: 'Ultra High-Speed Connectivity',
                desc: 'Dedicated enterprise optical-fiber Wi-Fi access throughout suites, business lounges, and conference chambers.',
              },
              {
                icon: ShieldCheck,
                title: 'VIP Privacy & 24/7 Security',
                desc: 'Discreet biometric access, dedicated round-the-clock safety officers, and private guest reception lobbies.',
              },
            ].map((amenity, idx) => {
              const Icon = amenity.icon;
              return (
                <div
                  key={idx}
                  className="card card-luxury-hover"
                  style={{
                    backgroundColor: '#0D2340',
                    border: '1px solid #263E59',
                    padding: '2rem',
                    borderRadius: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(214, 183, 121, 0.14)',
                      border: '1px solid rgba(214, 183, 121, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#D6B779',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '0.6rem', fontWeight: '600' }}>
                    {amenity.title}
                  </h3>
                  <p style={{ color: '#A8B8CC', fontSize: '0.88rem', lineHeight: '1.6' }}>
                    {amenity.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Visual Experience Showcase */}
          <div
            id="dining"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              marginTop: '4rem',
            }}
          >
            <div
              className="card-luxury-hover"
              style={{
                height: '280px',
                borderRadius: '16px',
                backgroundImage:
                  'linear-gradient(rgba(7,26,49,0.2), rgba(7,26,49,0.65)), url(/images/hotel_spa_pool.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '1.8rem',
                border: '1px solid #263E59',
                overflow: 'hidden',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#D6B779',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '0.25rem',
                  }}
                >
                  Serenity Oasis
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#F8FAFC' }}>
                  Heated Rooftop Pool & Spa
                </div>
              </div>
            </div>

            <div
              className="card-luxury-hover"
              style={{
                height: '280px',
                borderRadius: '16px',
                backgroundImage:
                  'linear-gradient(rgba(7,26,49,0.15), rgba(7,26,49,0.65)), url(/images/hotel_dining.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '1.8rem',
                border: '1px solid #263E59',
                overflow: 'hidden',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#D6B779',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '0.25rem',
                  }}
                >
                  Rooftop Gastronomy
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#F8FAFC' }}>
                  Michelin Dining & Champagne Cellar
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospitality Standards & Pillars */}
      <section style={{ padding: '5.5rem 2rem', maxWidth: '1140px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.3rem',
              color: '#D6B779',
              marginBottom: '0.75rem',
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="#D6B779" />
            ))}
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#F8FAFC' }}>
            The LuxuryStay Standard of Hospitality
          </h2>
          <p style={{ color: '#A8B8CC', maxWidth: '620px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
            Uncompromising privacy, dedicated concierge attention, and seamless digital booking.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '2rem' }}>
          {[
            {
              title: 'Unrivaled Comfort & Privacy',
              desc: 'Every suite is engineered with sound-dampening aesthetics, signature bedding, and private city and garden terraces.',
              highlight: 'Quiet Luxury',
            },
            {
              title: 'Tailored Concierge & Dining',
              desc: 'Dedicated in-suite dining options, personalized concierge coordination, and curated amenities tailored to your itinerary.',
              highlight: 'Bespoke Care',
            },
            {
              title: 'Verified Digital Reservations',
              desc: 'Instant booking validation, real-time invoice folios, contactless room key issuance, and 24/7 guest support.',
              highlight: 'Live Security',
            },
          ].map((pillar, i) => (
            <div
              key={i}
              className="card card-luxury-hover"
              style={{
                backgroundColor: '#0D2340',
                border: '1px solid #263E59',
                padding: '2.2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '14px',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.74rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: '#D6B779',
                    fontWeight: '700',
                    marginBottom: '0.85rem',
                  }}
                >
                  {pillar.highlight}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#F8FAFC', marginBottom: '0.85rem' }}>
                  {pillar.title}
                </h3>
                <p style={{ color: '#A8B8CC', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Dynamic Call to Action Section */}
      <section
        style={{
          padding: '4.5rem 2rem',
          background: 'linear-gradient(180deg, #071A31 0%, #051325 100%)',
          borderTop: '1px solid #263E59',
        }}
      >
        <div
          className="anim-glow"
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            backgroundColor: '#0E294A',
            border: '1px solid #D6B779',
            borderRadius: '20px',
            padding: '3.5rem 3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          <div style={{ maxWidth: '580px' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: '#D6B779',
                textTransform: 'uppercase',
                fontWeight: '700',
                letterSpacing: '0.12em',
              }}
            >
              {isAuthenticated ? 'WELCOME BACK TO LUXURYSTAY' : 'RESERVE YOUR BESPOKE STAY'}
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                color: '#F8FAFC',
                marginTop: '0.4rem',
                marginBottom: '0.85rem',
                lineHeight: '1.2',
              }}
            >
              {isAuthenticated
                ? `Ready to enhance your stay, ${user?.name?.split(' ')[0]}?`
                : 'Ready for an Unforgettable Experience?'}
            </h3>
            <p style={{ color: '#C4D4E8', fontSize: '0.98rem', lineHeight: '1.6' }}>
              {isAuthenticated
                ? 'Your authenticated session is active. Access your reservation folios, request in-suite dining, or navigate the hotel management platform.'
                : 'Sign up as a guest to make instant reservations, or log in to manage your bookings and in-room services.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg btn-shimmer" style={{ gap: '0.5rem' }}>
                  <LayoutDashboard size={18} /> Open Dashboard
                </Link>
                <Link to="/reservations" className="btn btn-secondary btn-lg" style={{ gap: '0.5rem' }}>
                  <Calendar size={18} /> View My Bookings
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg btn-shimmer">
                  Create Guest Account
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Account Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer with Bespoke Emblem & Dynamic Navigation */}
      <footer
        id="contact"
        style={{
          backgroundColor: '#040E1B',
          borderTop: '1px solid #263E59',
          padding: '4.5rem 2rem 2.5rem',
          color: '#A8B8CC',
          fontSize: '0.86rem',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <LuxuryLogo size="sm" subtitle="Resort & Residences" animated={false} />
            </div>
            <p style={{ lineHeight: '1.65', color: '#889CB5', marginBottom: '1rem' }}>
              A world-class five-star luxury hotel and resort offering bespoke hospitality, royal accommodations,
              and automated hospitality management.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#F8FAFC', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: '600' }}>
              Portals & Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" style={{ color: '#D6B779', fontWeight: '600' }}>
                    → Active Session Dashboard
                  </Link>
                  <Link to="/reservations" style={{ color: '#A8B8CC' }}>
                    My Bookings & Reservations
                  </Link>
                  <Link to="/profile" style={{ color: '#A8B8CC' }}>
                    Guest Profile & Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ color: '#A8B8CC' }}>
                    Staff Management Portal
                  </Link>
                  <Link to="/login?role=guest" style={{ color: '#A8B8CC' }}>
                    Guest Portal & Login
                  </Link>
                  <Link to="/register" style={{ color: '#A8B8CC' }}>
                    Register Guest Profile
                  </Link>
                  <Link to="/forgot-password" style={{ color: '#A8B8CC' }}>
                    Reset Lost Password
                  </Link>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#F8FAFC', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: '600' }}>
              Hotel Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <span>24/7 In-Room Dining</span>
              <span>Housekeeping & Laundry</span>
              <span>VIP Transportation & Valet</span>
              <span>Conference & Grand Banquet</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#F8FAFC', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: '600' }}>
              Concierge Contact
            </h4>
            <p style={{ marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} style={{ color: '#D6B779' }} /> +92 (21) 111-589-879
            </p>
            <p style={{ marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} style={{ color: '#D6B779' }} /> reception@luxurystay.com
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} style={{ color: '#D6B779' }} /> Royal Avenue, Suite 100, Karachi
            </p>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            paddingTop: '2rem',
            borderTop: '1px solid #143253',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p>© {new Date().getFullYear()} LuxuryStay Hospitality Management System. All rights reserved.</p>
          <p style={{ color: '#D6B779', fontWeight: '500' }}>Five-Star Hospitality • ISO 9001 Certified</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
