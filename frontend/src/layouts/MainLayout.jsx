import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Page transition state
  const location = useLocation();
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    setPageVisible(false);
    const t = setTimeout(() => {
      setPageVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#071A31' }}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isCollapsed ? '80px' : '260px',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="main-wrapper"
      >
        <TopNavigation
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Page content with fade-slide transition */}
        <main
          style={{
            flex: 1,
            padding: '1.75rem',
            overflowY: 'auto',
            opacity: pageVisible ? 1 : 0,
            transform: pageVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
          className="page-content"
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .main-wrapper       { margin-left: 0 !important; }
          .sidebar            { transform: translateX(-100%); }
          .sidebar.mobile-open { transform: translateX(0) !important; }
          .mobile-toggle-btn  { display: flex !important; }
          .mobile-only        { display: flex !important; }
          .desktop-only       { display: none !important; }
          .desktop-date       { display: none !important; }
          .search-container   { display: none !important; }
          .user-info-text     { display: none !important; }
          .page-content       { padding: 1rem !important; }
        }
        @media (min-width: 901px) {
          .mobile-toggle-btn { display: none !important; }
          .mobile-only       { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
