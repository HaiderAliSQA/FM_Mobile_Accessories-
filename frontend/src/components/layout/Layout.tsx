// frontend/src/components/layout/Layout.tsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBar from './PromoBar';
import CartDrawer from '../ui/CartDrawer';
import WhatsAppWidget from '../ui/WhatsAppWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-navy-dark flex flex-col font-body text-white">
      <PromoBar />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppWidget />
    </div>
  );
};

export default Layout;
