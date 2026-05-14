import React from 'react';
import { Link } from 'react-router-dom';

const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full bg-navy-dark overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy-mid to-[#0D1B2E] z-0" />
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" 
           style={{ backgroundImage: 'radial-gradient(#3B82F6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <div className="w-full md:w-1/2 flex flex-col items-start text-left animate-fade-up">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-electric/10 border border-electric/30 text-electric text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
              🔥 Pakistan's Best Mobile Accessories Store
            </span>
            
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Your One-Stop <br />
              <span className="text-electric">Mobile Shop</span>
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-lg mb-10 leading-relaxed">
              Quality accessories for every phone — JazzCash, Easypaisa & COD available nationwide. Premium protection for your devices.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/products" className="btn-electric px-10 py-4 text-sm font-bold uppercase tracking-widest">
                Shop Now →
              </Link>
              <Link to="/products?category=all" className="btn-outline-white px-10 py-4 text-sm font-bold uppercase tracking-widest">
                View Categories
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full pt-8 border-t border-white/5">
              {[
                { icon: '📦', text: 'Fast Delivery' },
                { icon: '💳', text: 'COD Available' },
                { icon: '✅', text: '100% Original' },
                { icon: '🔄', text: 'Easy Returns' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  <span className="text-lg">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right Product Image */}
          <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px] flex items-center justify-center">
            {/* Background blur decorative element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square bg-blue-glow/20 blur-[100px] rounded-full z-10 pointer-events-none"></div>
            
            {/* Main Featured Image */}
            <div className="relative w-full max-w-lg aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-glow-blue animate-float border border-white/10 z-20">
              <img 
                src="/images/premium-accessories.png" 
                alt="Premium Mobile Accessories" 
                className="w-full h-full object-cover"
              />
              {/* Optional glow effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-electric/10 to-transparent mix-blend-overlay pointer-events-none"></div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
