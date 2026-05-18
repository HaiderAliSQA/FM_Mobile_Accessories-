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
    { label: 'Orders', path: '/admin/wholesale-orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  const wholesaleLinks = [
    { label: 'Ledger Payments', path: '/admin/wholesale-payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  ];


  return (
    <div className="h-screen bg-navy-dark font-body text-white flex overflow-hidden">

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-navy-mid border-r border-navy-light z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between border-b border-navy-light px-6 shrink-0 bg-navy-mid">
          <Link to="/admin/dashboard" className="flex flex-col">
            <span className="font-heading text-white text-2xl font-black tracking-tighter">
              FH MOBILE
            </span>
            <span className="text-electric text-[9px] tracking-[0.3em] uppercase font-bold glow-blue">
              Management
            </span>
          </Link>

          {/* Internal sidebar close for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {/* Main Navigation */}
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path) && link.path !== '/';
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${isActive
                    ? 'bg-electric/20 text-blue-glow border border-electric/30 shadow-glow-blue'
                    : 'text-gray-400 hover:bg-navy-light hover:text-white'
                  }`}
              >
                <svg className={`w-5 h-5 ${isActive ? 'text-blue-glow' : 'text-gray-400 group-hover:text-blue-glow'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={link.icon} />
                </svg>
                <span className="text-[11px] tracking-[0.2em] uppercase font-bold">{link.label}</span>
              </Link>
            );
          })}

          {/* Wholesale Section */}
          <div className="pt-4 pb-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 px-4 mb-2">Wholesale / B2B</p>
          </div>
          {wholesaleLinks.filter(l => l.path !== '/').map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${isActive
                    ? 'bg-electric/20 text-blue-glow border border-electric/30 shadow-glow-blue'
                    : 'text-gray-400 hover:bg-navy-light hover:text-white'
                  }`}
              >
                <svg className={`w-5 h-5 ${isActive ? 'text-blue-glow' : 'text-gray-400 group-hover:text-blue-glow'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={link.icon} />
                </svg>
                <span className="text-[11px] tracking-[0.2em] uppercase font-bold">{link.label}</span>
              </Link>
            );
          })}

          {/* Back to Store */}
          <div className="pt-2">
            <Link to="/" className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-gray-500 hover:bg-navy-light hover:text-white group">
              <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-[11px] tracking-[0.2em] uppercase font-bold">Back to Store</span>
            </Link>
          </div>
        </nav>


        {/* Footer info / Logout */}
        <div className="p-6 border-t border-navy-light shrink-0 bg-navy-mid">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-navy-dark border border-fm-red/30 text-fm-red hover:bg-fm-red hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl group shadow-card"
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
        className={`flex-1 flex flex-col min-w-0 bg-navy-dark transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
      >
        {/* Universal Sticky Header */}
        <header className="h-20 bg-navy-mid border-b border-navy-light flex items-center px-6 shrink-0 justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 text-white hover:text-electric transition-all transform active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <span className="font-heading text-white text-lg font-bold tracking-wider uppercase">
                {navLinks.find(l => location.pathname.includes(l.path))?.label || 'Administration'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-electric hover:underline mr-2">
              View Site
            </Link>
            <div className="w-8 h-8 rounded-full bg-electric text-white flex items-center justify-center font-bold text-xs ring-2 ring-electric/30 shadow-glow-blue">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] bg-navy-dark p-6">
          <div className="max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

