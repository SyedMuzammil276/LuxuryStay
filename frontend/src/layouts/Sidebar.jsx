import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BedDouble,
  CalendarCheck,
  KeyRound,
  Receipt,
  Sparkles,
  Wrench,
  ConciergeBell,
  Star,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Crown,
  Globe,
  Shield,
} from 'lucide-react';
import LuxuryLogo from '../components/common/LuxuryLogo';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, role, isAdmin, isManager, isFrontDesk, isHousekeeping, isMaintenance, isGuest } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define nav items with role-based accessibility
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      to: '/staff',
      label: 'Staff & Roles',
      icon: Users,
      show: isAdmin,
    },
    {
      to: '/guests',
      label: 'Guests',
      icon: UserCheck,
      show: isFrontDesk,
    },
    {
      to: '/rooms',
      label: 'Rooms',
      icon: BedDouble,
      show: true,
    },
    {
      to: '/reservations',
      label: 'Reservations',
      icon: CalendarCheck,
      show: isFrontDesk || isGuest,
    },
    {
      to: '/operations',
      label: 'Check-in / Check-out',
      icon: KeyRound,
      show: isFrontDesk,
    },
    {
      to: '/billing',
      label: 'Billing & Invoices',
      icon: Receipt,
      show: isFrontDesk || isGuest,
    },
    {
      to: '/housekeeping',
      label: 'Housekeeping',
      icon: Sparkles,
      show: isFrontDesk || isHousekeeping,
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      show: isFrontDesk || isMaintenance,
    },
    {
      to: '/guest-services',
      label: 'Guest Services',
      icon: ConciergeBell,
      show: isFrontDesk || isHousekeeping || isGuest,
    },
    {
      to: '/feedback',
      label: isGuest ? 'Submit Feedback' : 'View Feedback',
      icon: Star,
      show: isGuest || isManager,
    },
    {
      to: '/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      show: isManager,
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      show: true,
    },
    {
      to: '/settings',
      label: 'System Settings',
      icon: Settings,
      show: isManager,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 13, 24, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: isCollapsed ? '80px' : '260px',
          height: '100vh',
          backgroundColor: '#061529',
          borderRight: '1px solid #263E59',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease',
          transform: isMobileOpen
            ? 'translateX(0)'
            : 'translateX(0)', // On desktop always visible; on mobile handled by CSS media query
        }}
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '72px',
            padding: isCollapsed ? '0.75rem' : '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid #263E59',
          }}
        >
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <LuxuryLogo
              size={isCollapsed ? 'sm' : 'md'}
              showText={!isCollapsed}
              subtitle="Hospitality HMS"
              animated={true}
            />
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="desktop-only"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              padding: '0.35rem',
              color: '#A8B8CC',
              borderRadius: '6px',
              border: '1px solid rgba(38, 62, 89, 0.7)',
              background: '#0D2340',
              cursor: 'pointer',
              display: isCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="mobile-only"
            style={{
              color: '#A8B8CC',
              padding: '0.5rem',
              display: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isCollapsed ? '1rem 0.5rem' : '1rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCollapsed ? '0' : '0.85rem',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    padding: isCollapsed ? '0.75rem 0' : '0.7rem 1rem',
                    borderRadius: '8px',
                    color: isActive ? '#D6B779' : '#A8B8CC',
                    backgroundColor: isActive ? 'rgba(214, 183, 121, 0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid #D6B779' : '3px solid transparent',
                    fontWeight: isActive ? '600' : '400',
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={19} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </div>

        {/* User Footer Profile & Actions */}
        <div
          style={{
            padding: isCollapsed ? '1rem 0.5rem' : '1rem',
            borderTop: '1px solid #263E59',
            backgroundColor: '#071A31',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isCollapsed ? '0' : '0.75rem',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              marginBottom: isCollapsed ? '0.5rem' : '0.75rem',
            }}
          >
            {/* Luxury Avatar with Live Indicator */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFF8E7 0%, #D6B779 50%, #A8823B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#061529',
                  fontWeight: '800',
                  fontSize: '0.92rem',
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
                  border: '1.5px solid #061529',
                  boxShadow: '0 0 6px #27AE75',
                }}
              />
            </div>

            {!isCollapsed && (
              <div style={{ overflow: 'hidden', flex: 1, textAlign: 'left', lineHeight: '1.2' }}>
                <p
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    color: '#F8FAFC',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.name || 'Authorized User'}
                </p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '1px 6px',
                    borderRadius: '6px',
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
                        ? '1px solid rgba(214, 183, 121, 0.4)'
                        : user?.role === 'guest'
                        ? '1px solid rgba(85, 167, 232, 0.4)'
                        : '1px solid rgba(39, 174, 117, 0.4)',
                  }}
                >
                  {user?.role === 'admin' && <Crown size={9} />}
                  {user?.role === 'guest' && <Sparkles size={9} />}
                  {user?.role !== 'admin' && user?.role !== 'guest' && <Shield size={9} />}
                  {user?.role || 'Guest'}
                </span>
              </div>
            )}
          </div>

          {/* Quick link to Public Website */}
          <button
            onClick={() => {
              navigate('/');
              setIsMobileOpen(false);
            }}
            title="View Hotel Public Website"
            style={{
              width: '100%',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '0.5rem',
              borderRadius: '6px',
              color: '#D6B779',
              background: 'rgba(214, 183, 121, 0.08)',
              border: '1px solid rgba(214, 183, 121, 0.25)',
              fontSize: '0.78rem',
              marginBottom: '0.55rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(214, 183, 121, 0.16)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(214, 183, 121, 0.08)')}
          >
            <Globe size={15} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span style={{ fontWeight: '500' }}>View Hotel Website</span>}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              justifyContent: isCollapsed ? 'center' : 'space-between',
            }}
          >
            <button
              onClick={() => {
                navigate('/profile');
                setIsMobileOpen(false);
              }}
              title="My Profile"
              style={{
                flex: isCollapsed ? 'none' : '1',
                padding: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                borderRadius: '6px',
                color: '#A8B8CC',
                background: '#0D2340',
                border: '1px solid #263E59',
                fontSize: '0.78rem',
              }}
            >
              <User size={15} />
              {!isCollapsed && <span>Profile</span>}
            </button>

            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                flex: isCollapsed ? 'none' : '1',
                padding: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                borderRadius: '6px',
                color: '#E45B65',
                background: 'rgba(228, 91, 101, 0.1)',
                border: '1px solid rgba(228, 91, 101, 0.3)',
                fontSize: '0.78rem',
              }}
            >
              <LogOut size={15} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
