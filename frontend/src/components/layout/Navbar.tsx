import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import SearchBar from '../SearchBar';

const Navbar: React.FC = () => {
  const { count, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const categories = [
    { name: 'Chargers', slug: 'chargers' },
    { name: 'Hands Free', slug: 'hands-free' },
    { name: 'Data Cables', slug: 'data-cables' },
    { name: 'Mobile Covers', slug: 'mobile-covers' },
    { name: 'Memory Cards', slug: 'memory-cards' },
    { name: 'Power Banks', slug: 'power-banks' },
    { name: 'Glass Protectors', slug: 'glass-protectors' },
    { name: 'Selfie Sticks', slug: 'selfie-sticks' },
    { name: 'Bluetooth', slug: 'bluetooth' },
    { name: 'Others', slug: 'other-accessories' },
  ];

  return (
    <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-navy-mid/95 backdrop-blur-md shadow-lg py-2' : 'bg-navy-mid py-3 md:py-4'
    }`}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* TOP ROW: LOGO | SEARCH (DESKTOP) | CART/MENU */}
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <span className="font-heading text-xl md:text-2xl font-extrabold tracking-tight">
              <span className="text-electric">FH</span>
              <span className="text-white ml-2 hidden sm:inline">Mobile Accessories</span>
              <span className="text-white ml-1 inline sm:hidden text-lg">Mobile</span>
            </span>
          </Link>

          {/* Search Bar (Desktop Only) */}
          <div className="hidden md:block flex-1 max-w-2xl px-4">
            <SearchBar />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Cart Icon */}
            <button 
              onClick={toggleCart}
              className="relative p-2 text-white hover:text-electric transition-colors group"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center animate-bounce-cart shadow-lg">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white focus:outline-none"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* SECOND ROW (MOBILE ONLY): SEARCH BAR */}
        <div className="md:hidden mt-3 w-full animate-fade-in">
          <SearchBar />
        </div>
      </div>

      {/* QUICK LINKS BAR (DESKTOP) */}
      {!scrolled && (
        <div className="hidden md:block bg-navy-mid border-t border-white/5 mt-3 animate-fade-in">
          <div className="max-w-7xl mx-auto px-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-8 py-2.5">
              <Link 
                to="/"
                className="whitespace-nowrap text-[11px] font-bold text-electric hover:text-white uppercase tracking-widest transition-colors"
              >
                Home
              </Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.slug} 
                  to={`/products?category=${cat.slug}`}
                  className="whitespace-nowrap text-[11px] font-bold text-gray-400 hover:text-electric uppercase tracking-widest transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SLIDE-DOWN MENU */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-navy-mid border-t border-white/5 shadow-2xl transition-all duration-300 transform origin-top ${
        mobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
      }`}>
        <div className="px-6 py-8 grid grid-cols-2 gap-4">
          <Link 
            to="/"
            className="bg-navy-light p-4 rounded-xl flex flex-col items-center justify-center text-center border border-white/5 active:bg-navy-dark transition-all"
          >
            <span className="text-[11px] font-bold text-electric uppercase tracking-widest">Home</span>
          </Link>
          {categories.map((cat) => (
            <Link 
              key={cat.slug} 
              to={`/products?category=${cat.slug}`}
              className="bg-navy-light p-4 rounded-xl flex flex-col items-center justify-center text-center border border-white/5 active:bg-navy-dark transition-all"
            >
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
