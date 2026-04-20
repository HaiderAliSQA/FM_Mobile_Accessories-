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
      <div className="relative w-full max-w-[450px] h-full bg-white shadow-2xl flex flex-col animate-slideCartIn border-l border-fm-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-fm-border bg-[#FAFAF8]">
          <div className="flex flex-col gap-1">
            <h2 className="font-playfair text-[24px] font-bold tracking-tight text-fm-text">SHOPPING BAG</h2>
            <p className="font-dm text-[11px] text-fm-text-3 tracking-[0.2em] font-bold uppercase">
              {count} {count === 1 ? 'MASTERPIECE' : 'MASTERPIECES'} IN STOCK
            </p>
          </div>
          <button 
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-fm-surface-2 transition-colors group"
          >
            <svg className="w-6 h-6 text-fm-text-3 group-hover:text-fm-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto w-full px-8 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
              <div className="w-24 h-24 bg-[#F5F3EE] rounded-full flex items-center justify-center text-4xl shadow-inner">
                👜
              </div>
              <div>
                <h3 className="font-playfair text-[20px] text-fm-text font-bold mb-2">Your bag is empty</h3>
                <p className="font-dm text-[13px] text-fm-text-3 tracking-wide">
                  Browse our collection and find your perfect pair today.
                </p>
              </div>
              <button 
                onClick={() => { closeCart(); navigate('/products'); }} 
                className="btn-gold px-10 py-5 btn-magnetic"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : (
            <div className="flex flex-col w-full divide-y divide-fm-border">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-6 py-6 group">
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-[#F5F3EE] p-3 shrink-0 border border-fm-border group-hover:border-fm-gold/50 transition-colors">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-dm text-[13px] text-fm-text font-bold leading-tight uppercase tracking-wide group-hover:text-fm-gold transition-colors">{item.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          {item.color && (
                            <span className="font-dm text-[10px] font-bold text-fm-text-3 px-2 py-0.5 bg-[#F5F3EE] border border-fm-border uppercase">{item.color}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-fm-text-3 hover:text-fm-error transition-all hover:scale-110"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-fm-border bg-white h-10 rounded-sm">
                        <button 
                          className="w-10 h-full flex items-center justify-center font-dm text-fm-text-2 hover:bg-[#F5F3EE] transition-colors"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="px-4 font-dm text-[13px] text-fm-text font-bold min-w-[36px] text-center border-x border-fm-border">
                          {item.quantity}
                        </span>
                        <button 
                          className="w-10 h-full flex items-center justify-center font-dm text-fm-text-2 hover:bg-[#F5F3EE] transition-colors"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="font-playfair text-[18px] text-fm-text font-bold leading-none">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <span className="text-[9px] text-fm-text-3 font-bold mt-1 uppercase tracking-widest">{formatPrice(item.price)} each</span>
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
          <div className="p-8 bg-[#FAFAF8] border-t border-fm-border flex flex-col gap-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="space-y-3 mb-2">
              <div className="flex justify-between font-dm text-[11px] text-fm-text-3 font-bold tracking-widest uppercase">
                <span>SUBTOTAL VALUE</span>
                <span className="text-fm-text text-[13px]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-dm text-[11px] text-fm-text-3 font-bold tracking-widest uppercase">
                <span>DELIVERY CHARGES (TCS)</span>
                <span className="text-fm-text text-[13px]">
                  {formatPrice(deliveryCharges)}
                </span>
              </div>
            </div>
            
            <div className="h-px w-full bg-fm-border my-2"></div>
            
            <div className="flex justify-between items-baseline mb-6">
              <span className="font-playfair text-[22px] font-bold text-fm-text tracking-tighter uppercase">ESTIMATED TOTAL</span>
              <span className="font-playfair text-[26px] font-bold text-fm-text-2">{formatPrice(total)}</span>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { closeCart(); navigate('/checkout'); }}
                className="w-full bg-[#1A1714] text-white font-dm py-5 tracking-[0.2em] text-[11px] font-bold uppercase transition-all duration-500 hover:bg-fm-gold hover:shadow-xl flex justify-center items-center gap-3 btn-magnetic"
              >
                PROCEED TO CHECKOUT
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button 
                onClick={closeCart}
                className="w-full font-dm text-[10px] text-fm-text-3 uppercase tracking-[0.3em] font-bold py-3 hover:text-fm-text transition-colors"
              >
                &larr; CONTINUE SELECTION
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
