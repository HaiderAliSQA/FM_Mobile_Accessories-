// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';

import ContactUs from './pages/customer-care/ContactUs';
import ShippingPolicy from './pages/customer-care/ShippingPolicy';
import ReturnsExchanges from './pages/customer-care/ReturnsExchanges';
import TrackOrder from './pages/customer-care/TrackOrder';

import { lazy, Suspense } from 'react';

// Admin Pages
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts'));
const AdminAddProduct = lazy(() => import('./pages/admin/AdminAddProduct'));
const AdminEditProduct= lazy(() => import('./pages/admin/AdminEditProduct'));
const AdminOrders     = lazy(() => import('./pages/admin/AdminOrders'));

const adminFallback = (
  <div style={{
    display:'flex', alignItems:'center', justifyContent:'center',
    height:'100vh', fontFamily:'DM Sans', fontSize:'13px',
    color:'#9C9890', letterSpacing:'2px'
  }}>
    LOADING...
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#E8E0D0',
            border: '1px solid #2A2A2A',
            borderRadius: '4px',
          },
          success: {
            iconTheme: {
              primary: '#C9A84C',
              secondary: '#1A1A1A',
            },
          },
        }}
      />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Suspense fallback={adminFallback}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Suspense fallback={adminFallback}><AdminDashboard /></Suspense>} />
          <Route path="dashboard" element={<Suspense fallback={adminFallback}><AdminDashboard /></Suspense>} />
          <Route path="products" element={<Suspense fallback={adminFallback}><AdminProducts /></Suspense>} />
          <Route path="products/add" element={<Suspense fallback={adminFallback}><AdminAddProduct /></Suspense>} />
          <Route path="products/edit/:id" element={<Suspense fallback={adminFallback}><AdminEditProduct /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={adminFallback}><AdminOrders /></Suspense>} />
        </Route>

        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/product/:slug" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        <Route path="/order-confirmation/:orderNumber" element={<Layout><OrderConfirmation /></Layout>} />

        <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
        <Route path="/shipping-policy" element={<Layout><ShippingPolicy /></Layout>} />
        <Route path="/returns-policy" element={<Layout><ReturnsExchanges /></Layout>} />
        <Route path="/track-order" element={<Layout><TrackOrder /></Layout>} />

        {/* 404 */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
