// frontend/src/pages/ProductDetail.tsx
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductBySlugQuery, useGetProductsQuery } from '../store/api/productsApi';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/ui/ProductCard';
import toast from 'react-hot-toast';
import { cloudinaryUrl } from '../utils/cloudinaryUrl';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data, isLoading, isError } = useGetProductBySlugQuery(slug || '');
  const product = data?.data;

  const { data: relatedData } = useGetProductsQuery(
    { category: product?.category, limit: 4 },
    { skip: !product }
  );
  
  const relatedProducts = (relatedData?.data?.products || []).filter(p => p._id !== product?._id).slice(0, 4);

  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="min-h-[85vh] bg-[#FAFAF8] pt-32 pb-12 flex justify-center">
        <div className="w-16 h-16 border-4 border-fm-surface-2 border-t-fm-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[85vh] bg-[#FAFAF8] pt-32 pb-12 flex flex-col items-center justify-center">
        <h2 className="font-playfair text-4xl text-fm-text mb-4">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="btn-outline">
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    addToCart({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0] || '',
      color: selectedColor ?? undefined,
    });
    
    toast.success('Added to cart');
  };

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-dm text-[11px] text-fm-text-3 tracking-widest uppercase mb-8">
          <button onClick={() => navigate('/')} className="hover:text-fm-gold transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-fm-gold transition-colors">Products</button>
          <span>/</span>
          <span className="text-fm-text-2">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-20 animate-fadeIn">
          
          {/* Gallery - Thumbnails on left for all viewports */}
          <div className="flex flex-row gap-2 sm:gap-4 h-fit">
            {/* Thumbnails Column (Fixed left, vertical) */}
            <div className="flex flex-col gap-2 sm:gap-3 w-14 sm:w-20 shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMainImageIndex(i);
                    scrollRef.current?.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' });
                  }}
                  className={`aspect-square bg-white border ${mainImageIndex === i ? 'border-fm-text shadow-md' : 'border-fm-border'} cursor-pointer hover:border-fm-text transition-all overflow-hidden p-1 sm:p-1.5`}
                >
                  <img src={cloudinaryUrl(img, { width: 120 })} alt={`Thumbnail ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>

            {/* Main Image Container (Horizontal Scroll Carousel) */}
            <div className="flex-1 flex flex-col gap-4 relative group/gallery">
              <div 
                ref={scrollRef}
                onClick={() => setIsLightboxOpen(true)}
                className="aspect-[4/5] bg-transparent overflow-x-auto snap-x snap-mandatory flex no-scrollbar scroll-smooth cursor-zoom-in"
                onScroll={(e) => {
                  const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                  const width = (e.target as HTMLDivElement).clientWidth;
                  const newIndex = Math.round(scrollLeft / width);
                  if (newIndex !== mainImageIndex) setMainImageIndex(newIndex);
                }}
              >
                {product.images.map((img, i) => (
                  <div key={i} className="min-w-full h-full snap-center flex items-center justify-center p-0 sm:p-10 relative">
                    {product.isNewArrival && i === 0 && (
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-block px-2 sm:px-3 py-1 bg-fm-text text-white font-dm text-[9px] sm:text-[10px] tracking-[4px] uppercase z-10 shadow-sm">
                        New Arrival
                      </div>
                    )}
                    {discount > 0 && i === 0 && (
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-block px-2 sm:px-3 py-1 bg-fm-error text-white font-dm text-[9px] sm:text-[10px] tracking-[4px] uppercase z-10 shadow-sm font-bold">
                        SAVE {discount}%
                      </div>
                    )}
                    <img 
                      src={cloudinaryUrl(img || '/placeholder-shoe.jpg', { width: 900 })}
                      alt={product.name}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {/* Prev/Next Navigation Arrows (Desktop overlay only) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  scrollRef.current?.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
                }}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 border border-fm-border rounded-full items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10 hover:bg-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
                }}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 border border-fm-border rounded-full items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10 hover:bg-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>

              {/* Gallery Indicators (Mobile visibility only) */}
              <div className="md:hidden flex flex-col items-center gap-3 mt-4">
                {/* Dot Indicators */}
                <div className="flex justify-center gap-1.5">
                  {product.images.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => scrollRef.current?.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' })}
                      className={`h-1 rounded-full transition-all ${mainImageIndex === i ? 'bg-fm-text w-6' : 'bg-fm-border w-1.5'}`}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-[160px] h-1 bg-fm-border/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fm-gold transition-all duration-300"
                    style={{ width: `${((mainImageIndex + 1) / product.images.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col py-2 md:py-6">
            {product.isDiscontinued && (
              <div className="bg-red-50 border border-red-200 text-red-700 font-dm text-sm px-4 py-3 tracking-wider text-center mb-4 md:mb-6 rounded-sm flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                This item has been discontinued and is no longer available.
              </div>
            )}
            
            <h1 className="font-playfair text-[32px] md:text-[40px] text-fm-text font-semibold leading-[1.1] mb-2 md:mb-4 break-words">
              {product.name}
            </h1>
            
            {/* Price line */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-dm text-[28px] text-[#C41E3A] font-bold">
                RS.{product.price.toLocaleString('en-PK')} PKR
              </span>
              {discount > 0 && (
                <span className="font-dm text-[16px] text-fm-text-3 line-through opacity-60">
                  RS.{product.compareAtPrice?.toLocaleString('en-PK')} PKR
                </span>
              )}
            </div>

            {/* Selection Area */}
            {!product.isDiscontinued && product.stock > 0 && (
              <>
                <div className="flex flex-col gap-1 mb-6 py-4 border-y border-fm-border/30">
                  {product.brand && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-dm text-fm-text-3 uppercase tracking-wider">Brand</span>
                      <span className="font-dm text-fm-text font-bold uppercase">{product.brand}</span>
                    </div>
                  )}
                  {product.compatibleModels && product.compatibleModels.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="font-dm text-sm text-fm-text-3 uppercase tracking-wider">Compatible With</span>
                      <div className="flex flex-wrap gap-2">
                        {product.compatibleModels.map(model => (
                          <span key={model} className="bg-fm-surface-2 px-3 py-1 text-[11px] font-bold text-fm-text border border-fm-border rounded-full">{model}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className="flex items-center h-[50px] border border-fm-border bg-white w-[140px] shrink-0">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="flex-1 h-full text-fm-text-3 hover:text-fm-text hover:bg-fm-surface-2 transition-colors font-dm text-lg"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-dm text-[14px] text-fm-text font-medium">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="flex-1 h-full text-fm-text-3 hover:text-fm-text hover:bg-fm-surface-2 transition-colors font-dm text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Colors */}
                {product.colors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-dm text-[11px] tracking-widest uppercase text-fm-text-3 font-semibold mb-3">
                      Select Color
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={
                            color === selectedColor
                              ? "border border-fm-text bg-fm-text text-white font-dm text-xs py-2 px-5 uppercase tracking-widest transition-colors"
                              : "border border-fm-border bg-white text-fm-text font-dm text-xs py-2 px-5 uppercase tracking-widest hover:border-fm-text transition-colors cursor-pointer"
                          }
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Area */}
                <div className="flex flex-col gap-3 mb-6">
                  <button 
                    onClick={handleAddToCart}
                    className="w-full h-[50px] border-2 border-[#C9A84C] bg-white text-fm-text font-dm text-[12px] tracking-[0.2em] font-bold uppercase transition-all duration-300 animate-btn-shine"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => {
                      handleAddToCart();
                      navigate('/checkout');
                    }}
                    className="w-full h-[50px] text-white font-dm text-[12px] tracking-[0.2em] font-bold uppercase flex items-center justify-center gap-3 buy-it-now-the-best"
                  >
                    <svg className="w-5 h-5 text-fm-gold animate-pulse text-gold-shimmer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Buy it Now
                  </button>
                </div>

                <div className="font-dm text-[#5C5650] text-[14px] leading-relaxed mb-6 whitespace-pre-line">
                  {product.description}
                </div>
              </>
            )}

            {/* Fullscreen Lightbox */}
            {isLightboxOpen && (
              <div className="fixed inset-0 z-[200] bg-black animate-fadeIn flex flex-col">
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[210] bg-gradient-to-b from-black/50 to-transparent">
                  <span className="text-white font-dm text-xs tracking-widest uppercase">
                    {mainImageIndex + 1} / {product.images.length} — {product.name}
                  </span>
                  <button 
                    onClick={() => setIsLightboxOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                
                <div 
                  className="flex-1 overflow-x-auto snap-x snap-mandatory flex no-scrollbar scroll-smooth"
                  onScroll={(e) => {
                    const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                    const width = (e.target as HTMLDivElement).clientWidth;
                    const newIndex = Math.round(scrollLeft / width);
                    if (newIndex !== mainImageIndex) {
                      setMainImageIndex(newIndex);
                      scrollRef.current?.scrollTo({ left: newIndex * scrollRef.current.clientWidth, behavior: 'instant' });
                    }
                  }}
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {product.images.map((img, i) => (
                    <div key={i} className="min-w-full h-full flex items-center justify-center snap-center p-4">
                      <img 
                        src={cloudinaryUrl(img, { width: 900 })} 
                        alt={`Fullscreen ${i + 1}`} 
                        loading="lazy"
                        decoding="async"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-[210]">
                  {product.images.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all ${mainImageIndex === i ? 'bg-white w-8' : 'bg-white/30 w-4'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Area for OOS/Discontinued */}
            {(product.isDiscontinued || product.stock <= 0) && (
              <button disabled className="w-full h-14 bg-fm-surface-2 text-fm-text-3 border border-fm-border font-dm text-[13px] tracking-widest uppercase cursor-not-allowed mb-8">
                Out of Stock
              </button>
            )}

            {product.stock <= 5 && product.stock > 0 && !product.isDiscontinued && (
              <div className="flex items-center gap-2 text-fm-error font-dm text-xs font-semibold uppercase tracking-wider mb-8">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Low Stock — Only {product.stock} items left
              </div>
            )}

            {/* Guarantee Flags */}
            <div className="flex flex-col gap-5 pt-8 border-t border-fm-border">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-[#fbf6e9] text-fm-gold flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"/></svg>
                </div>
                <p className="font-dm text-[13px] text-fm-text font-medium group-hover:text-fm-gold transition-colors">100% Genuine Product Guarantee</p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-[#fbf6e9] text-fm-gold flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <p className="font-dm text-[13px] text-fm-text font-medium group-hover:text-fm-gold transition-colors">Priority Delivery across Pakistan (TCS)</p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-[#fbf6e9] text-fm-gold flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <p className="font-dm text-[13px] text-fm-text font-medium group-hover:text-fm-gold transition-colors">Secure Checkout & Easy Returns</p>
              </div>
            </div>

          </div>
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-fm-border">
            <h2 className="font-playfair text-3xl text-fm-text uppercase text-center tracking-widest mb-12">
              Complete Your Look
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
