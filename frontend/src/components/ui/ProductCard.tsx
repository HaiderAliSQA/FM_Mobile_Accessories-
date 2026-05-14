// frontend/src/components/ui/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { formatPrice, discountPercent } from '../../utils/formatPrice';

interface ProductCardProps {
  product: Product;
  index?: number; // for stagger animation delay
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
      slug: product.slug,
      color: product.colors?.[0] || 'Original',
    });
  };

  const discount = discountPercent(product.price, product.compareAtPrice || 0);

  // Derived Tech Badge logic
  const getTechBadge = () => {
    if (product.category === 'chargers') return '20W FAST';
    if (product.category === 'power-banks') return '20000mAh';
    if (product.category === 'glass-protectors') return '9D GLASS';
    if (product.category === 'hands-free' || product.category === 'bluetooth') return 'HD AUDIO';
    return 'PREMIUM';
  };

  return (
    <div 
      className="group relative flex flex-col bg-navy-mid border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-electric/30 hover:shadow-glow-blue/10" 
      style={{ transitionDelay: `${(index || 0) * 0.05}s` }}
    >
      <Link to={`/product/${product.slug}`} className="w-full relative block">
        {/* IMAGE AREA */}
        <div className="relative w-full aspect-square overflow-hidden bg-navy-dark/30">
          <img 
            src={product.images[0] || '/placeholder.png'} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
          />

          {/* BADGES */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            <span className="bg-electric text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg uppercase tracking-widest">
              {getTechBadge()}
            </span>
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-lg uppercase tracking-widest">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* INFO AREA */}
        <div className="p-4 md:p-5 flex flex-col">
          <h3 className="font-heading text-xs md:text-sm font-bold text-white mb-2 line-clamp-2 min-h-[2.5rem] leading-tight">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-electric font-bold text-sm md:text-base">
                PKR {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-gray-500 line-through text-[10px] md:text-xs">
                  PKR {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            
            <button 
              onClick={handleQuickAdd}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-electric/10 text-electric border border-electric/20 rounded-xl hover:bg-electric hover:text-white transition-all overflow-hidden"
              aria-label="Add to Cart"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
