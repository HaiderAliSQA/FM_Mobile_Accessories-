import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

const categories = [
  { name: 'Chargers',          slug: 'chargers',          icon: '🔌', count: 24 },
  { name: 'Hands Free',        slug: 'hands-free',        icon: '🎧', count: 18 },
  { name: 'Data Cables',       slug: 'data-cables',       icon: '🔗', count: 32 },
  { name: 'Mobile Covers',     slug: 'mobile-covers',     icon: '📱', count: 150 },
  { name: 'Memory Cards',      slug: 'memory-cards',      icon: '💾', count: 12 },
  { name: 'Power Banks',       slug: 'power-banks',       icon: '🔋', count: 15 },
  { name: 'Glass Protectors',  slug: 'glass-protectors',  icon: '🛡️', count: 85 },
  { name: 'Selfie Sticks',     slug: 'selfie-sticks',     icon: '🤳', count: 8 },
  { name: 'Bluetooth',         slug: 'bluetooth',         icon: '📡', count: 22 },
  { name: 'Other Accessories', slug: 'other-accessories', icon: '📦', count: 40 },
];

const CategoryGrid: React.FC = () => {
  const revealRef = useScrollReveal();

  return (
    <section className="py-16 md:py-24 bg-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10 md:mb-12">
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-white">
            Shop by <span className="text-electric">Category</span>
          </h2>
          <Link to="/products" className="text-electric hover:text-blue-400 font-bold text-xs md:text-sm uppercase tracking-widest transition-colors">
            View All →
          </Link>
        </div>

        <div 
          ref={revealRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 opacity-0 translate-y-6"
        >
          {categories.map((cat) => (
            <Link 
              key={cat.slug} 
              to={`/products?category=${cat.slug}`}
              className="group bg-navy-light border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-electric/50 hover:shadow-glow-blue hover:scale-[1.03]"
            >
              <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
              <h3 className="font-heading font-bold text-white text-sm md:text-base mb-1 tracking-tight">
                {cat.name}
              </h3>
              <span className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">
                ({cat.count} products)
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
