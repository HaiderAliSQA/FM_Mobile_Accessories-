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
    
    // Auto-select first available size if any, or undefined
    const firstSize = product.sizes && product.sizes.find(s => !s.isBlocked)?.size;
    
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
      slug: product.slug,
      size: firstSize,
      color: product.colors?.[0] || 'Original',
    });
  };

  const discount = discountPercent(product.price, product.compareAtPrice || 0);

  return (
    <div 
      className="group relative flex flex-col items-center bg-white border border-[#EBEBEB]/50 hover:border-[#EBEBEB] transition-colors" 
      style={{ transitionDelay: `${(index || 0) * 0.06}s` }}
    >
      <Link to={`/product/${product.slug}`} className="w-full relative block px-2 pt-2">
        {/* IMAGE AREA */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#fafaf8]">
          <img 
            src={product.images[0] || '/placeholder.png'} 
            alt={product.name} 
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
          />

          {/* ADD TO CART BUTTON (slides up on hover) */}
          <button 
            className="absolute bottom-0 left-0 right-0 bg-[#1A1714] text-white py-3 md:py-4 text-center text-[10px] md:text-[11px] font-bold tracking-[0.2em] font-dm cursor-pointer transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 hover:bg-[#C9A84C] shadow-lg"
            onClick={handleQuickAdd}
          >
            ADD TO CART
          </button>

          {/* BADGES */}
          <div className="absolute top-0 left-0 flex flex-col z-10">
            {discount > 0 && (
              <span className="bg-[#E52B2B] text-white text-[11px] font-bold px-3 py-1 tracking-widest font-dm">
                SAVE {discount}%
              </span>
            )}
          </div>
        </div>

        {/* INFO AREA - EXACT CENTERING */}
        <div className="py-5 flex flex-col items-center text-center w-full px-1">
          <h3 className="font-dm text-[12px] font-bold text-[#1A1714] tracking-[0.1em] uppercase mb-2.5 line-clamp-1 w-full">
            {product.name}
          </h3>
          
          <div className="flex flex-col items-center w-full">
            <span className="font-dm text-[13px] font-bold text-[#E52B2B] tracking-widest mb-1.5 transition-colors group-hover:text-[#C9A84C]">
              {formatPrice(product.price)} PKR
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-dm text-[11px] text-[#A3A3A3] line-through tracking-widest opacity-80 decoration-[#A3A3A3]/50">
                {formatPrice(product.compareAtPrice)} PKR
              </span>
            )}
          </div>

          {/* Star row */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="flex text-[#E5C158] text-[11px] tracking-widest">
              {'★★★★★'}
            </div>
            <span className="font-dm text-[10px] text-[#A3A3A3] font-medium tracking-wider">(0.0)</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
