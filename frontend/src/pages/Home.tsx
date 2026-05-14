// frontend/src/pages/Home.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import ProductSkeleton from '../components/ui/ProductSkeleton';
import { useGetProductsQuery } from '../store/api/productsApi';
import { Category, CATEGORY_LABELS } from '../types';

import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';

const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  
  const { data: activeData, isLoading: loadingActive } = useGetProductsQuery({ 
    category: activeCategory !== 'all' ? activeCategory as Category : undefined, 
    limit: 10 
  });
  
  const { data: chargersData, isLoading: loadingChargers } = useGetProductsQuery({ category: 'chargers', limit: 5 });

  const renderProductGrid = (title: string, subtitle: string, data: any, loading: boolean, showCategoryBar = false) => {
    return (
      <section className="py-16 md:py-24 bg-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {showCategoryBar ? (
            <div className="mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white mb-8 text-center uppercase tracking-tight">
                Explore <span className="text-electric">Collection</span>
              </h2>
              <div className="flex overflow-x-auto gap-4 px-2 pb-6 no-scrollbar justify-start md:justify-center border-b border-white/5">
                <button 
                  onClick={() => setActiveCategory('all')}
                  className={`shrink-0 px-6 py-2 rounded-full font-body text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeCategory === 'all' ? 'bg-electric text-white shadow-glow-blue' : 'bg-navy-mid text-gray-400 hover:text-white border border-white/5'}`}
                >
                  All Products
                </button>
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                  <button 
                    key={key} 
                    onClick={() => setActiveCategory(key as Category)}
                    className={`shrink-0 px-6 py-2 rounded-full font-body text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeCategory === key ? 'bg-electric text-white shadow-glow-blue' : 'bg-navy-mid text-gray-400 hover:text-white border border-white/5'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white mb-2 uppercase tracking-tight">{title}</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">{subtitle}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : data?.data?.products?.length > 0 ? (
              data.data.products.map((p: any, i: number) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-navy-mid/50 rounded-3xl border border-white/5">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                  {subtitle} coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-navy-dark">
      
      <HeroBanner />

      <CategoryGrid />

      {/* DYNAMIC FILTER GRID */}
      {renderProductGrid('Featured', 'Our top picks for you', activeData, loadingActive, true)}

      {/* SECTION: BRAND PROMISE */}
      <section className="py-20 bg-navy-mid border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'TCS Delivery', desc: 'Secure & fast shipping across all cities in Pakistan.', icon: '🚚' },
              { title: 'Premium Quality', desc: '100% genuine accessories tested for performance.', icon: '🛡️' },
              { title: 'Easy Returns', desc: '7-day hassle-free return policy for peace of mind.', icon: '🔄' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-navy-light rounded-2xl flex items-center justify-center text-3xl shadow-glow-blue/10 border border-white/5">
                  {item.icon}
                </div>
                <h3 className="font-heading text-lg font-bold text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: PROMO BANNER (Power) */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-electric/5 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-navy-light rounded-[3rem] p-10 md:p-20 border border-white/5 flex flex-col md:flex-row items-center gap-12 overflow-hidden group">
            <div className="md:w-1/2 space-y-6">
              <span className="text-electric font-bold uppercase tracking-[0.3em] text-[10px]">Ultra Power Pack</span>
              <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white leading-tight">
                FAST <span className="text-electric">POWERRR</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Stay charged with our premium 20W & 65W chargers. Designed for speed, built for safety.
              </p>
              <Link to="/category/chargers" className="btn-electric px-12 py-5 inline-block font-bold">
                EXPLORE CHARGERS →
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <span className="text-[120px] md:text-[200px] drop-shadow-glow group-hover:scale-110 transition-transform duration-700">🔋</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CHARGERS */}
      {renderProductGrid('Chargers', 'Ultra-fast charging solutions', chargersData, loadingChargers)}

      {/* NEWSLETTER */}
      <section className="py-32 bg-navy-dark relative border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-6 uppercase tracking-tight">
            Join the <span className="text-electric">Tech Club</span>
          </h2>
          <p className="text-gray-400 mb-12">
            Get exclusive early access to New Arrivals and amazing discounts.
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Your email address"
              className="flex-1 bg-navy-mid border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-electric transition-colors"
            />
            <button className="btn-electric px-12 py-4 rounded-2xl font-bold uppercase tracking-widest whitespace-nowrap">
              Join Now
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
