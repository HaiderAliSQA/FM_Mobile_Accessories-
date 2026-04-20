import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { Category, CATEGORY_ICONS, CATEGORY_LABELS } from '../../types';
import SearchBar from '../SearchBar';

const MEGA_MENU_CATEGORIES: Category[] = [
  'chargers', 'hands-free', 'data-cables', 'mobile-covers', 'memory-cards', 
  'power-banks', 'glass-protectors', 'selfie-sticks', 'bluetooth', 'other-accessories'
];

const Navbar: React.FC = () => {
  const { count, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setMobileOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);


  return (
    <header className="fixed top-0 left-0 right-0 z-[100]">
      {/* 1. ANNOUNCEMENT BAR - SOLIDLY FIXED AT VERY TOP */}
      <div className="bg-premium-dark overflow-hidden py-2 sm:py-2.5 border-b border-fm-gold/30 flex relative z-[110] shadow-md w-full">
        <div className="marquee-content inline-flex shrink-0">
          <div className="premium-announcement-text text-[11px] sm:text-[13px] font-dm tracking-[0.3em] font-black uppercase py-0.5 whitespace-nowrap">
            QUALITY MOBILE ACCESSORIES &nbsp;&bull;&nbsp; TCS DELIVERY ACROSS PAKISTAN &nbsp;&bull;&nbsp; 7-DAY RETURNS &nbsp;&bull;&nbsp; 100% GENUINE PRODUCTS &nbsp;&bull;&nbsp;
            QUALITY MOBILE ACCESSORIES &nbsp;&bull;&nbsp; TCS DELIVERY ACROSS PAKISTAN &nbsp;&bull;&nbsp; 7-DAY RETURNS &nbsp;&bull;&nbsp; 100% GENUINE PRODUCTS &nbsp;&bull;&nbsp;
          </div>
          <div className="premium-announcement-text text-[11px] sm:text-[13px] font-dm tracking-[0.3em] font-black uppercase py-0.5 whitespace-nowrap">
            QUALITY MOBILE ACCESSORIES &nbsp;&bull;&nbsp; TCS DELIVERY ACROSS PAKISTAN &nbsp;&bull;&nbsp; 7-DAY RETURNS &nbsp;&bull;&nbsp; 100% GENUINE PRODUCTS &nbsp;&bull;&nbsp;
            QUALITY MOBILE ACCESSORIES &nbsp;&bull;&nbsp; TCS DELIVERY ACROSS PAKISTAN &nbsp;&bull;&nbsp; 7-DAY RETURNS &nbsp;&bull;&nbsp; 100% GENUINE PRODUCTS &nbsp;&bull;&nbsp;
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <nav className={`transition-all duration-500 relative z-[60] ${scrolled ? 'navbar-scrolled h-[70px]' : 'bg-white h-[85px] border-b border-fm-border'
        }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full gap-2">

            {/* Logo */}
            <Link to="/" className="flex flex-col group mr-2 md:mr-4 shrink-0">
              <span className="font-playfair text-[18px] md:text-[22px] font-bold text-fm-text tracking-[2px] md:tracking-[3px] uppercase leading-none">
                FM Mobile
              </span>
              <span className="font-dm text-[8px] tracking-[4px] text-fm-text-3 uppercase mt-1 group-hover:text-fm-gold transition-colors">
                Accessories
              </span>
            </Link>

            {/* Smart Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 mx-4">
              <SearchBar />
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-10 h-full">
              <Link to="/" className="font-dm text-[12px] font-bold tracking-[0.15em] text-fm-text hover:text-fm-gold transition-colors uppercase">Home</Link>

              <div
                className="h-full flex items-center group cursor-pointer"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <div className="font-dm text-[12px] font-bold tracking-[0.15em] text-fm-text group-hover:text-fm-gold transition-colors uppercase flex items-center gap-1">
                  Collection
                  <svg className={`w-3 h-3 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown Panel */}
                <div
                  className={`absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-fm-border transition-all duration-500 transform origin-top ${megaMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
                >
                  <div className="max-w-7xl mx-auto px-10 py-12">
                    <div className="grid grid-cols-5 gap-y-10 gap-x-8">
                      {MEGA_MENU_CATEGORIES.map((cat) => (
                        <Link
                          key={cat}
                          to={`/products?category=${cat}`}
                          className="flex items-center gap-4 group/item select-none"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#f8f5f0] flex items-center justify-center text-2xl group-hover/item:bg-fm-gold group-hover/item:text-white transition-all duration-300 shadow-sm">
                            {CATEGORY_ICONS[cat]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-dm text-[11px] font-bold text-fm-text group-hover/item:text-fm-gold transition-colors uppercase tracking-[0.1em]">{CATEGORY_LABELS[cat]}</span>
                            <span className="font-dm text-[9px] text-fm-text-3 uppercase tracking-wider mt-0.5">Explore Style</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/products" className="font-dm text-[12px] font-bold tracking-[0.15em] text-fm-text hover:text-fm-gold transition-colors uppercase">New Arrivals</Link>
              <Link to="/products?category=best-selling" className="font-dm text-[12px] font-bold tracking-[0.15em] text-fm-gold hover:text-fm-text transition-colors uppercase">Trending</Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden text-fm-text hover:text-fm-gold transition-all duration-300 hover:scale-110"
                aria-label="Search"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button
                onClick={toggleCart}
                className="relative text-fm-text hover:text-fm-gold transition-all duration-300 hover:scale-110 focus:outline-none group"
                aria-label="Toggle cart"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-fm-gold text-white text-[8px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 scale-100 animate-scaleIn">
                    {count}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-fm-text hover:text-fm-gold transition-colors focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE SEARCH OVERLAY (Slide-down) */}
      <div
        className={`absolute top-full left-0 right-0 lg:hidden bg-white shadow-2xl transition-all duration-500 transform origin-top border-b border-fm-border ${searchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="px-6 py-6">
          <SearchBar />
        </div>
      </div>

      {/* MOBILE MENU (Slide-in) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-[80%] h-full bg-white shadow-2xl animate-slideInRight flex flex-col p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="font-playfair text-2xl font-bold tracking-widest uppercase">FM MOBILE</span>
              <button onClick={() => setMobileOpen(false)} className="text-fm-text">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col space-y-4 overflow-y-auto">
              <div className="flex items-center gap-6">
                <Link to="/" onClick={() => setMobileOpen(false)} className="font-playfair text-[20px] font-semibold uppercase tracking-[0.2em] animate-colorCycle transition-colors">Home</Link>
                <Link to="/products" onClick={() => setMobileOpen(false)} className="font-playfair text-[20px] font-semibold uppercase tracking-[0.2em] animate-colorCycle transition-colors">Collection</Link>
              </div>
              <Link to="/products" onClick={() => setMobileOpen(false)} className="font-playfair text-[20px] font-semibold uppercase tracking-[0.25em] animate-colorCycle transition-colors">New Drops</Link>
              <div className="h-px bg-fm-border w-full my-3"></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {MEGA_MENU_CATEGORIES.slice(0, 10).map(cat => (
                  <Link key={cat} to={`/products?category=${cat}`} onClick={() => setMobileOpen(false)} className="flex flex-col items-center gap-2 py-3 px-2 bg-[#fcfaf7] border border-fm-border/20 rounded-md hover:border-fm-gold/40 hover:shadow-sm transition-all animate-menuFloat">
                    <span className="text-3xl filter drop-shadow-sm">{CATEGORY_ICONS[cat]}</span>
                    <span className="font-dm text-[9px] font-bold text-fm-text uppercase tracking-widest text-center">{CATEGORY_LABELS[cat]}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to push content below the fixed header */}
      <div className={`${scrolled ? 'h-[100px]' : 'h-[115px]'} bg-transparent w-full transition-all duration-500 absolute top-full pointer-events-none`} />
    </header>
  );
};

export default Navbar;
