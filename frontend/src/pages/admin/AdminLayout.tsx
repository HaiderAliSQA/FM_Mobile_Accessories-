// frontend/src/pages/admin/AdminLayout.tsx
import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { selectIsAuthenticated, logout } from '../../store/authSlice';
import { useLogoutMutation } from '../../store/api/adminApi';

const AdminLayout: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [logoutApi] = useLogoutMutation();
  
  // Initialize from localStorage to persist across reloads
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage when state changes
  React.useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
    }
  };

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Products', path: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Orders', path: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { label: 'Back to Store', path: '/', icon: 'M10 19l-7-7m0 0l7-7m-7 7h18' },
  ];

  return (
    <div className="h-screen bg-fm-bg font-dm text-fm-text flex overflow-hidden">
      
      {/* Mobile Backdrop Overlay - Only for very small screens when sidebar overlays */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-fm-text/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-fm-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between border-b border-fm-border px-6 shrink-0 bg-[#FAFAF8]">
          <Link to="/admin/dashboard" className="flex flex-col">
            <span className="font-playfair text-fm-text text-2xl font-black tracking-tighter">
              FM MOBILE
            </span>
            <span className="text-fm-text-3 text-[9px] tracking-[0.3em] uppercase font-bold">
              Management
            </span>
          </Link>
          
          {/* Internal sidebar close for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-fm-text-3 hover:text-fm-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path) && link.path !== '/';
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-sm transition-all group ${
                  isActive
                    ? 'bg-[#1A1714] text-[#B8860B] font-bold shadow-lg shadow-black/5'
                    : 'text-fm-text-2 hover:bg-[#FAF9F6] hover:text-[#1A1714]'
                }`}
              >
                <svg className={`w-5 h-5 ${isActive ? 'text-[#B8860B]' : 'text-fm-text-3 group-hover:text-[#B8860B]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={link.icon} />
                </svg>
                <span className="text-[11px] tracking-[0.2em] uppercase font-black">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info / Logout */}
        <div className="p-6 border-t border-fm-border shrink-0 bg-[#FAFAF8]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border border-fm-error/20 text-fm-error hover:bg-red-50 hover:border-fm-error transition-all text-[10px] font-black uppercase tracking-[0.2em] rounded-sm group"
          >
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 bg-[#F7F5F0] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        {/* Universal Sticky Header */}
        <header className="h-20 bg-white border-b border-fm-border flex items-center px-6 shrink-0 justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-fm-text hover:text-[#B8860B] transition-all transform active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <span className="font-playfair text-[#1A1714] text-lg font-black tracking-tight uppercase">
                {navLinks.find(l => location.pathname.includes(l.path))?.label || 'Administration'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[#B8860B] hover:underline mr-2">
              View Site
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#1A1714] text-[#B8860B] flex items-center justify-center font-bold text-xs ring-2 ring-[#F7F5F0]">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-[#F7F5F0]">
          <div className="max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
