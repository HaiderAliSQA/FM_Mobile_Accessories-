// frontend/src/components/ui/CartDrawer.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';

const CartDrawer: React.FC = () => {
  const { 
    isOpen, 
    closeCart, 
    items, 
    count, 
    subtotal, 
    deliveryCharges, 
    total, 
    updateQuantity, 
    removeFromCart 
  } = useCart();
  
  const navigate = useNavigate();

  // Close cart on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-fm-text/40 backdrop-blur-[4px] animate-fadeIn"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-[450px] h-full bg-navy-mid shadow-2xl flex flex-col animate-slideCartIn border-l border-navy-light">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-light bg-navy-mid">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-[18px] font-black tracking-tight text-white uppercase">SHOPPING BAG</h2>
            <p className="font-body text-[10px] text-gray-400 tracking-[0.15em] font-extrabold uppercase">
              {count} {count === 1 ? 'ITEM' : 'ITEMS'} IN BAG
            </p>
          </div>
          <button 
            onClick={closeCart}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-electric/10 hover:bg-electric text-white border border-electric/30 hover:border-electric rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <span>Continue</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto w-full px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
              <div className="w-20 h-20 bg-[#F5F3EE] rounded-full flex items-center justify-center text-3xl shadow-inner">
                👜
              </div>
              <div>
                <h3 className="font-heading text-[18px] text-white font-bold mb-2">Your bag is empty</h3>
                <p className="font-body text-[12px] text-gray-400 tracking-wide">
                  Browse our collection and find your perfect pair today.
                </p>
              </div>
              <button 
                onClick={() => { closeCart(); navigate('/products'); }} 
                className="btn-electric px-8 py-3 text-xs uppercase font-bold tracking-widest cursor-pointer"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : (
            <div className="flex flex-col w-full divide-y divide-white/5">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-4 group items-center">
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-[#F5F3EE] p-2 shrink-0 border border-white/5 rounded-xl group-hover:border-electric/30 transition-colors flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-heading text-xs text-white font-extrabold leading-snug uppercase tracking-wide group-hover:text-electric transition-colors line-clamp-2 min-h-[2rem]">
                        {item.name}
                      </h4>
                      <button 
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-gray-500 hover:text-red-500 transition-all hover:scale-110 shrink-0 p-1 cursor-pointer"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-0.5">
                      {/* Quantity Controls - Sleek & Fully Visible */}
                      <div className="flex items-center bg-navy-dark border border-white/10 rounded-lg overflow-hidden h-8 shrink-0">
                        <button 
                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-colors font-bold text-sm cursor-pointer"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white min-w-[24px] text-center border-x border-white/5">
                          {item.quantity}
                        </span>
                        <button 
                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-colors font-bold text-sm cursor-pointer"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-heading text-sm text-electric font-black leading-none">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                          {formatPrice(item.price)} each
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 bg-navy-mid border-t border-navy-light flex flex-col gap-3 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
            
            {/* Wholesale B2B Dynamic Delivery Alert */}
            <div className="animate-pulse-glow">
              {count === 1 ? (
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] text-center leading-relaxed">
                  ⚠️ Add <span className="underline text-white font-black">1 more item</span> to get <span className="text-electric">FREE TCS DELIVERY</span>!
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] text-center leading-relaxed">
                  🎉 Wholesale Bonus: <span className="text-white font-black">FREE TCS DELIVERY</span> applied!
                </div>
              )}
            </div>

            <div className="space-y-1.5 mt-1">
              <div className="flex justify-between font-body text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                <span>Subtotal Value</span>
                <span className="text-white text-xs">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-body text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                <span>Delivery (TCS)</span>
                <span className={deliveryCharges === 0 ? "text-emerald-400 text-xs font-extrabold" : "text-white text-xs"}>
                  {deliveryCharges === 0 ? "FREE" : formatPrice(deliveryCharges)}
                </span>
              </div>
            </div>
            
            <div className="h-px w-full bg-white/5 my-1"></div>
            
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-heading text-xs font-extrabold text-white tracking-wider uppercase">ESTIMATED TOTAL</span>
              <span className="font-heading text-lg font-black text-electric">{formatPrice(total)}</span>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { closeCart(); navigate('/checkout'); }}
                className="w-full bg-electric hover:shadow-glow-blue text-white font-heading py-3.5 tracking-[0.15em] text-[10px] font-black uppercase transition-all duration-300 flex justify-center items-center gap-2 btn-magnetic rounded-xl cursor-pointer"
              >
                PROCEED TO CHECKOUT
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
