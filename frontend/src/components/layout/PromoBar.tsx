import React from 'react';

const PromoBar: React.FC = () => {
  return (
    <div className="bg-electric text-white text-[10px] md:text-xs font-semibold py-2 overflow-hidden border-b border-white/5 relative z-[60]">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        <span className="mx-8 uppercase tracking-widest">🔌 Fast Chargers from PKR 299</span>
        <span className="mx-8 uppercase tracking-widest">🎧 Earphones Under PKR 500</span>
        <span className="mx-8 uppercase tracking-widest">📱 Mobile Covers for All Models</span>
        <span className="mx-8 uppercase tracking-widest">💳 COD Available Nationwide</span>
        <span className="mx-8 uppercase tracking-widest">🔋 Power Banks Up to 20000mAh</span>
        <span className="mx-8 uppercase tracking-widest">🛡️ 9D Tempered Glass PKR 199</span>
        
        {/* Duplicate for seamless looping */}
        <span className="mx-8 uppercase tracking-widest">🔌 Fast Chargers from PKR 299</span>
        <span className="mx-8 uppercase tracking-widest">🎧 Earphones Under PKR 500</span>
        <span className="mx-8 uppercase tracking-widest">📱 Mobile Covers for All Models</span>
        <span className="mx-8 uppercase tracking-widest">💳 COD Available Nationwide</span>
        <span className="mx-8 uppercase tracking-widest">🔋 Power Banks Up to 20000mAh</span>
        <span className="mx-8 uppercase tracking-widest">🛡️ 9D Tempered Glass PKR 199</span>
      </div>
    </div>
  );
};

export default PromoBar;
