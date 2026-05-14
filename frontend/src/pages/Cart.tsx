// frontend/src/pages/Cart.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartDelivery,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
} from '../store/cartSlice';

const formatPKR = (amount: number): string =>
  `PKR ${amount.toLocaleString('en-PK')}`;

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const delivery = useAppSelector(selectCartDelivery);
  const total = useAppSelector(selectCartTotal);

  const handleRemove = (productId: string, size?: number, color?: string) => {
    dispatch(removeFromCart({ productId, size: size || 0, color: color || '' }));
  };

  const handleQuantityChange = (productId: string, size: number | undefined, color: string | undefined, qty: number) => {
    dispatch(updateQuantity({ productId, size: size || 0, color: color || '', quantity: qty }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-navy-dark pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-navy-mid rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-glow-blue/10">
          <svg className="w-12 h-12 text-electric/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="font-heading text-white text-3xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight italic">
          Cart is <span className="text-electric">Empty</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base mb-10 max-w-md tracking-widest uppercase font-bold">
          Power up your device with our premium accessories.
        </p>
        <Link
          to="/products"
          className="btn-electric px-12 py-5 rounded-2xl font-extrabold uppercase tracking-widest shadow-glow-blue"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-dark pt-24 md:pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end gap-4 mb-10 md:mb-16">
          <h1 className="font-heading text-white text-4xl md:text-6xl font-extrabold uppercase tracking-tighter italic">
            Shopping <span className="text-electric">Cart</span>
          </h1>
          <span className="text-gray-600 font-bold mb-2 tracking-widest text-sm uppercase">({items.length} items)</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Cart Items */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-6 border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-[0.3em] font-extrabold">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-3 text-center">Qty</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-4">
              {items.map((item) => {
                const uniqueKey = `${item.productId}-${item.size || 'nosize'}-${item.color || 'nocolor'}`;
                return (
                  <div
                    key={uniqueKey}
                    className="p-6 bg-navy-mid border border-white/5 rounded-[2rem] flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center transition-all hover:border-electric/20 group"
                  >
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-6 w-full">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-navy-dark rounded-2xl border border-white/5 overflow-hidden p-2">
                        <Link to={`/product/${item.slug}`}>
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                          />
                        </Link>
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/product/${item.slug}`}
                          className="font-heading text-white text-lg md:text-xl font-bold hover:text-electric transition-colors block mb-1 leading-tight"
                        >
                          {item.name}
                        </Link>
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest space-y-1">
                          {item.color && <p>Color: <span className="text-gray-300">{item.color}</span></p>}
                          <p className="text-electric/60">Premium Accessory</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.productId, item.size, item.color)}
                          className="mt-4 text-red-400/50 hover:text-red-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove From Cart
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3 flex justify-between sm:justify-center items-center w-full sm:w-auto">
                      <span className="sm:hidden text-gray-500 text-[10px] uppercase tracking-widest font-extrabold">Quantity</span>
                      <div className="flex items-center bg-navy-dark border border-white/5 rounded-xl h-10 w-32 overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex-1 h-full text-gray-500 hover:text-electric disabled:opacity-10 transition-colors text-xl"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-white font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity + 1)}
                          className="flex-1 h-full text-gray-500 hover:text-electric transition-colors text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price Total */}
                    <div className="col-span-3 flex justify-between sm:justify-end items-center w-full sm:w-auto">
                      <span className="sm:hidden text-gray-500 text-[10px] uppercase tracking-widest font-extrabold">Subtotal</span>
                      <span className="text-electric font-extrabold text-xl">
                        {formatPKR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-navy-mid border border-white/5 p-8 md:p-10 rounded-[3rem] sticky top-32 shadow-2xl space-y-8">
              <h2 className="font-heading text-white text-2xl font-extrabold uppercase tracking-tight italic border-b border-white/5 pb-6">Summary</h2>
              
              <div className="space-y-6 font-body text-sm">
                <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                  <span>Subtotal</span>
                  <span className="text-white text-base">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                  <span>Shipping TCS</span>
                  <span className={delivery === 0 ? 'text-green-400' : 'text-white text-base'}>
                    {delivery === 0 ? 'FREE' : formatPKR(delivery)}
                  </span>
                </div>
                
                {delivery > 0 && (
                  <div className="bg-electric/5 border border-electric/10 rounded-2xl p-4 text-electric text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Add {formatPKR(5000 - subtotal)} more for <span className="underline">FREE TCS DELIVERY</span> across Pakistan.
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <span className="font-heading text-white text-xl font-bold uppercase">Total</span>
                <div className="text-right">
                  <span className="text-electric font-extrabold text-3xl block leading-none tracking-tight">{formatPKR(total)}</span>
                  <span className="text-gray-600 text-[10px] uppercase tracking-[0.3em] font-bold block mt-2">GST Included</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-electric w-full py-5 text-base font-extrabold uppercase tracking-widest rounded-2xl shadow-glow-blue animate-pulse-glow"
              >
                Checkout Now →
              </button>
              
              <div className="flex items-center justify-center gap-4 py-4 opacity-50">
                 <div className="flex items-center gap-2 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">
                    <span>COD</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>JazzCash</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span>EasyPaisa</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
