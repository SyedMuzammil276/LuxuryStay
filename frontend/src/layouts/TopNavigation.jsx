import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Calendar,
  ChevronRight,
  ChevronDown,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  Shield,
  Crown,
  Sparkles,
} from 'lucide-react';

export const TopNavigation = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Derive breadcrumb path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const formatName = (str) =>
    str
      .replace(/-/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    if (q.includes('room')) navigate('/rooms');
    else if (q.includes('res') || q.includes('book')) navigate('/reservations');
    else if (q.includes('guest')) navigate('/guests');
    else if (q.includes('bill') || q.includes('inv')) navigate('/billing');
    else if (q.includes('clean') || q.includes('house')) navigate('/housekeeping');
    else if (q.includes('maint')) navigate('/maintenance');
    else navigate(`/reservations?confirmationCode=${encodeURIComponent(q)}`);
  };

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'rgba(7, 26, 49, 0.97)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid #263E59',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'box-shadow 0.3s ease',
        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* Left Section: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="mobile-toggle-btn"
          aria-label="Toggle navigation drawer"
          style={{
            padding: '0.45rem',
            color: '#F8FAFC',
            backgroundColor: '#0D2340',
            border: '1px solid #263E59',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <Link
            to="/dashboard"
            style={{ color: '#A8B8CC', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#D6B779'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#A8B8CC'; }}
          >
            Home
          </Link>
          {pathParts.map((part, idx) => {
            const path = `/${pathParts.slice(0, idx + 1).join('/')}`;
            const isLast = idx === pathParts.length - 1;
            return (
              <React.Fragment key={path}>
                <ChevronRight size={14} style={{ color: '#263E59' }} />
                {isLast ? (
                  <span style={{ color: '#D6B779', fontWeight: '600' }}>
                    {formatName(part)}
                  </span>
                ) : (
                  <Link
                    to={path}
                    style={{ color: '#A8B8CC', textDecoration: 'none' }}
                  >
                    {formatName(part)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Middle Section: Quick Search bar */}
      <div className="search-container" style={{ flex: '1', maxWidth: '380px', margin: '0 1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#A8B8CC',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search rooms, confirmation codes, guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.4rem',
              paddingRight: '0.85rem',
              fontSize: '0.82rem',
              height: '38px',
              backgroundColor: '#0D2340',
              border: '1px solid #263E59',
              borderRadius: '20px',
              color: '#F8FAFC',
            }}
          />
        </form>
      </div>

      {/* Right Section: Date, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Date Display */}
        <div
          className="desktop-date"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#A8B8CC',
            fontSize: '0.82rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: '#0D2340',
            border: '1px solid #263E59',
            borderRadius: '6px',
          }}
        >
          <Calendar size={15} style={{ color: '#D6B779' }} />
          <span>{todayDateString}</span>
        </div>

        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View notifications"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#0D2340',
              border: '1px solid #263E59',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F8FAFC',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#D6B779',
                  color: '#061529',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '1px 6px',
                  minWidth: '18px',
                  lineHeight: '1.4',
                  boxShadow: '0 0 6px rgba(214, 183, 121, 0.6)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '340px',
                backgroundColor: '#0D2340',
                border: '1px solid #D6B779',
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 200,
                overflow: 'hidden',
                animation: 'scaleIn 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '0.9rem 1rem',
                  borderBottom: '1px solid #263E59',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={16} style={{ color: '#D6B779' }} />
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#F8FAFC' }}>
                    Notifications ({unreadCount})
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      fontSize: '0.75rem',
                      color: '#D6B779',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#A8B8CC' }}>
                    <p style={{ fontSize: '0.85rem' }}>No recent notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.read) markAsRead(n._id);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid rgba(38, 62, 89, 0.4)',
                        backgroundColor: n.read ? 'transparent' : 'rgba(214, 183, 121, 0.05)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: n.read ? '500' : '600', color: '#F8FAFC' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#A8B8CC' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#A8B8CC', lineHeight: '1.4' }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: '0.65rem',
                  textAlign: 'center',
                  borderTop: '1px solid #263E59',
                  backgroundColor: '#061529',
                }}
              >
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  style={{
                    fontSize: '0.78rem',
                    color: '#D6B779',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  View All Notifications <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.7rem',
              backgroundColor: isProfileOpen ? 'rgba(20, 50, 83, 0.95)' : 'rgba(13, 35, 64, 0.9)',
              border: isProfileOpen
                ? '1px solid #D6B779'
                : '1px solid rgba(214, 183, 121, 0.35)',
              borderRadius: '28px',
              padding: '0.35rem 0.85rem 0.35rem 0.4rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: isProfileOpen
                ? '0 0 16px rgba(214, 183, 121, 0.3)'
                : '0 2px 10px rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D6B779';
              e.currentTarget.style.boxShadow = '0 0 14px rgba(214, 183, 121, 0.25)';
            }}
            onMouseLeave={(e) => {
              if (!isProfileOpen) {
                e.currentTarget.style.borderColor = 'rgba(214, 183, 121, 0.35)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.25)';
              }
            }}
          >
            {/* Avatar with Live Indicator */}
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

            {/* User Name & Stylized Role Tag */}
            <div style={{ textAlign: 'left', lineHeight: '1.2' }} className="user-info-text">
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

              {/* Role Badge */}
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

            {/* Chevron Indicator */}
            <ChevronDown
              size={13}
              style={{
                color: '#D6B779',
                transition: 'transform 0.25s ease',
                transform: isProfileOpen ? 'rotate(180deg)' : 'none',
                marginLeft: '0.15rem',
              }}
            />
          </button>

          {/* Profile Dropdown Panel */}
          {isProfileOpen && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '220px',
                backgroundColor: '#0D2340',
                border: '1px solid #263E59',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 200,
                overflow: 'hidden',
                animation: 'scaleIn 0.15s ease-out',
              }}
            >
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #263E59' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#F8FAFC' }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: '0.74rem', color: '#A8B8CC', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
                <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={13} style={{ color: '#27AE75' }} />
                  <span style={{ fontSize: '0.7rem', color: '#27AE75', textTransform: 'capitalize' }}>
                    Active {user?.role}
                  </span>
                </div>
              </div>

              <div style={{ padding: '0.5rem' }}>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/profile');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#F8FAFC',
                    fontSize: '0.84rem',
                    borderRadius: '6px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(214, 183, 121, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <User size={15} style={{ color: '#D6B779' }} /> My Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#F8FAFC',
                    fontSize: '0.84rem',
                    borderRadius: '6px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(214, 183, 121, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <ExternalLink size={15} style={{ color: '#55A7E8' }} /> Public Hotel Page
                </button>

                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#E45B65',
                    fontSize: '0.84rem',
                    borderRadius: '6px',
                    textAlign: 'left',
                    marginTop: '0.2rem',
                    borderTop: '1px solid #263E59',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(228, 91, 101, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
