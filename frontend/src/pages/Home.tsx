// frontend/src/pages/Home.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import ProductSkeleton from '../components/ui/ProductSkeleton';
import { useGetProductsQuery } from '../store/api/productsApi';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Category, CATEGORY_LABELS } from '../types';

const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  
  const { data: activeData, isLoading: loadingActive } = useGetProductsQuery({ 
    category: activeCategory !== 'all' ? activeCategory as Category : undefined, 
    limit: 12 
  });
  
  const { data: chargersData, isLoading: loadingChargers } = useGetProductsQuery({ category: 'chargers', limit: 5 });
  const { data: audioData, isLoading: loadingAudio } = useGetProductsQuery({ category: 'hands-free', limit: 5 });

  const revealRef = useScrollReveal(0.15, [chargersData, activeData, audioData, loadingChargers, loadingActive, loadingAudio]);

  const renderProductGrid = (title: string, subtitle: string, data: any, loading: boolean, showCategoryBar = false) => {
    return (
      <section className="py-8 lg:py-16 bg-white overflow-hidden border-t border-[#EBEBEB]/50 first-of-type:border-t-0">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
          
          {showCategoryBar ? (
            <div className="mb-8 md:mb-12 w-full flex overflow-x-auto gap-6 md:gap-10 px-4 pb-4 snap-x snap-mandatory hide-scrollbar justify-start md:justify-center border-b border-[#EBEBEB]">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`snap-center shrink-0 font-dm text-[12px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 pb-2 relative group ${activeCategory === 'all' ? 'text-[#C9A84C] font-medium scale-105 filter drop-shadow-sm' : 'text-[#A3A3A3] hover:text-[#C9A84C] font-normal hover:scale-105'}`}
              >
                ALL PRODUCTS
                {activeCategory === 'all' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#C9A84C] animate-pulse"></div>}
              </button>
              {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                <button 
                  key={key} 
                  onClick={() => setActiveCategory(key as Category)}
                  className={`snap-center shrink-0 font-dm text-[12px] md:text-[14px] uppercase tracking-[0.1em] transition-all duration-300 pb-2 relative group ${activeCategory === key ? 'text-[#C9A84C] font-medium scale-105 filter drop-shadow-sm' : 'text-[#A3A3A3] hover:text-[#C9A84C] font-normal hover:scale-105'}`}
                >
                  {label}
                  {activeCategory === key && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#C9A84C] animate-pulse"></div>}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center mb-10 md:mb-12 scroll-reveal">
              <h2 className="font-playfair text-[28px] md:text-[36px] text-[#1A1714] tracking-wider uppercase">{title}</h2>
              <div className="underline-draw mx-auto mt-4 px-12"></div>
              <p className="font-dm text-[#A3A3A3] mt-4 tracking-widest uppercase text-[11px] font-bold">{subtitle}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : data?.data?.products?.length > 0 ? (
              data.data.products.map((p: any, i: number) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <span className="font-dm text-[#A3A3A3] tracking-widest uppercase text-xs">
                  {subtitle} coming soon
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-fm-bg" ref={revealRef}>
      
      {/* SECTION 1 — HERO */}
      <section className="relative w-full min-h-[50vh] md:min-h-[85vh] lg:min-h-[90vh] bg-[#F8F4EF] overflow-hidden flex items-center py-12 md:py-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 border border-fm-gold text-fm-gold font-dm text-[10px] tracking-[0.5em] font-bold uppercase scroll-reveal stagger-1 mb-8">
              Premium Accessories 2026
            </div>
            <h1 className="text-[42px] md:text-[86px] leading-[1.1] text-fm-text font-playfair mb-8">
              <span className="block scroll-reveal stagger-2">Your One-Stop</span>
              <span className="block scroll-reveal stagger-3 text-gold-shimmer">Mobile Shop</span>
            </h1>
            <p className="text-[16px] text-fm-text-3 font-dm leading-[1.8] max-w-lg mx-auto lg:mx-0 scroll-reveal stagger-4 mb-10">
              Quality mobile accessories at the best prices. From fast chargers to premium covers, we have everything to power up your digital life.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 scroll-reveal stagger-5">
               <Link to="/products" className="btn-gold px-10 py-5 btn-magnetic">Shop Accessories</Link>
              <Link to="/category/chargers" className="btn-outline px-10 py-5 btn-magnetic">Fast Chargers</Link>
            </div>
          </div>
          
          <div className="hidden lg:flex lg:col-span-5 justify-end relative scroll-reveal-right stagger-4">
            <div className="relative w-[480px] h-[620px]">
              <div className="absolute inset-4 border border-fm-text/10 p-2 z-0"></div>
              <div className="absolute inset-0 bg-[#F5F3EE] overflow-hidden flex items-center justify-center p-12">
                <img src="https://images.unsplash.com/photo-1601524909162-cd00632204c3?q=80&w=1000&auto=format&fit=crop" alt="Mobile Accessories" className="w-full h-auto object-contain transition-transform duration-[2s] hover:scale-110" />
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#1A1714] rounded-full flex items-center justify-center shadow-2xl border-2 border-fm-gold animate-spin-slow">
                  <div className="text-fm-gold font-dm text-[10px] font-bold tracking-[0.3em] uppercase rotate-12 text-center">BEST<br/>PRICES</div>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-fm-gold"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-fm-gold"></div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-3">
          <span className="font-dm text-[9px] tracking-[0.4em] text-fm-text-3 uppercase animate-pulse">Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-fm-gold to-transparent"></div>
        </div>
      </section>

      {/* SECTION 2 — TRUST BADGES */}
      <section className="bg-white border-y border-[#EBEBEB] py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex overflow-x-auto gap-8 pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar justify-start md:justify-center">
            {[
              { icon: '🚚', title: 'TCS Delivery', desc: 'Secure Shipping Pakistan' },
              { icon: '🔄', title: '7-Day Return', desc: 'Easy Policy' },
              { icon: '✨', title: '100% Genuine', desc: 'Authentic Accessories' },
              { icon: '📦', title: 'Delivery PKR 300', desc: 'Flat Rate Across Pakistan' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 min-w-[220px] md:min-w-fit shrink-0 snap-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-lg md:text-xl shadow-sm border border-[#EBEBEB]/50 shrink-0">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="font-playfair text-[14px] md:text-[15px] font-bold text-[#1A1714] whitespace-nowrap">{item.title}</span>
                  <span className="font-dm text-[10px] md:text-[11px] text-[#A3A3A3] tracking-wider uppercase font-medium whitespace-nowrap">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — DYNAMIC FILTER GRID */}
      {renderProductGrid('Discover', 'Quality accessories for every device', activeData, loadingActive, true)}

      {/* SECTION 5 — CHARGERS BANNER */}
      <section className="relative w-full bg-[#1A1714] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="scroll-reveal-left">
            <span className="font-dm text-fm-gold text-[12px] tracking-[0.5em] font-bold uppercase mb-6 block">Ultra Fast Power</span>
            <h2 className="font-playfair text-[42px] md:text-[72px] text-white leading-tight mb-8">
              FAST <br /> CHARGERS
            </h2>
            <p className="font-dm text-fm-text-3 text-[17px] leading-relaxed mb-12 max-w-lg">
              Never run out of juice. Our collection of fast chargers and power banks ensures your devices stay powered up wherever you go.
            </p>
            <div className="flex gap-6">
               <Link to="/category/chargers" className="btn-gold px-10 py-5">SHOP NOW</Link>
              <Link to="/products" className="btn-outline border-white text-white hover:bg-white hover:text-[#1A1714] px-10 py-5">VIEW ALL</Link>
            </div>
          </div>
          <div className="scroll-reveal-right flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[450px] aspect-square bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center group overflow-hidden border border-white/10 p-12">
               <span className="text-[100px] md:text-[180px] drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-110">🔌</span>
               <div className="absolute bottom-6 right-6 font-playfair text-white/10 text-6xl italic">Power</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — FEATURED CHARGERS */}
      {renderProductGrid('Fast Chargers', 'Stay connected with ultra-fast charging', chargersData, loadingChargers)}

      {/* SECTION 7 — AUDIO ACCESSORIES */}
      <section className="bg-[#F0EDE6] overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-1/2 min-h-[400px] md:min-h-[500px] h-auto relative overflow-hidden flex items-center justify-center p-20 scroll-reveal-left">
          <div className="absolute inset-4 border border-fm-text/5"></div>
          <div className="text-[140px] md:text-[240px] drop-shadow-2xl transition-transform duration-[3s] hover:rotate-12">🎧</div>
          <div className="absolute top-12 left-12 font-playfair text-fm-text-3 italic text-2xl">Audio</div>
        </div>
        <div className="lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-24 scroll-reveal-right">
          <span className="font-dm text-fm-gold text-[12px] tracking-[0.5em] font-bold uppercase mb-6 block">Premium Sound</span>
          <h2 className="font-playfair text-[36px] md:text-[56px] text-fm-text leading-tight mb-8">
            Crystal Clear <br /> Audio Gear
          </h2>
          <p className="font-dm text-fm-text-2 text-[16px] leading-[1.8] mb-12 max-w-md">
            Experience sound like never before. Our range of hands-free and Bluetooth headsets offers superior audio quality and comfort.
          </p>
          <div className="flex">
            <Link to="/category/hands-free" className="btn-gold px-12 py-5 flex items-center gap-4">
              EXPLORE AUDIO
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8 — AUDIO COLLECTION */}
      {renderProductGrid('Hands Free', 'Experience sound in its purest form', audioData, loadingAudio)}

      {/* SECTION 9 — NEWSLETTER + WHATSAPP */}
      <section className="bg-[#1A1714] py-32 overflow-hidden relative border-t border-white/5">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="scroll-reveal">
            <h2 className="font-playfair text-[28px] md:text-[48px] text-white leading-tight mb-6 uppercase tracking-wider">
              Join the Tech Club
            </h2>
            <p className="font-dm text-fm-text-3 text-[15px] mb-12 tracking-wide">
              Be the first to hear about new arrivals and exclusive deals for your mobile lifestyle.
            </p>
          </div>
          
          <form className="flex flex-col md:flex-row gap-4 mb-16 scroll-reveal scale">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-white/5 border border-white/10 text-white px-8 py-5 font-dm focus:outline-none focus:border-fm-gold focus:bg-white/10 transition-all placeholder-white/30"
            />
            <button type="button" className="btn-gold px-12 py-5 whitespace-nowrap btn-magnetic">SUBSCRIBE</button>
          </form>
          
          <div className="flex flex-col items-center scroll-reveal">
            <div className="h-px w-24 bg-fm-gold mb-8 opacity-30"></div>
            <p className="font-dm text-[11px] text-fm-text-3 tracking-[0.3em] font-medium uppercase">
              FM Mobile Accessories &bull; 2026
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
