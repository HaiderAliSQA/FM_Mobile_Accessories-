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
      <div className="min-h-screen bg-fm-black pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center">
        <svg className="w-24 h-24 text-fm-border mb-8 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h1 className="font-cormorant text-white text-3xl md:text-5xl mb-4">Your Bag is Empty</h1>
        <p className="text-fm-muted text-base md:text-lg font-jost mb-10 max-w-md tracking-wide">
          Explore our premium collection and find your perfect fit.
        </p>
        <Link
          to="/products"
          className="btn-gold px-12"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fm-black pt-24 md:pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-cormorant text-white text-3xl md:text-5xl mb-10 md:mb-12">Shopping Bag</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Cart Items */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-fm-border text-fm-gold text-xs uppercase tracking-[0.2em] font-jost font-semibold">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="divide-y divide-fm-border">
              {items.map((item, index) => {
                const uniqueKey = `${item.productId}-${item.size || 'nosize'}-${item.color || 'nocolor'}`;
                return (
                  <div
                    key={uniqueKey}
                    className="py-8 flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                  >
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-6 w-full">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-fm-surface border border-fm-border overflow-hidden">
                        <Link to={`/product/${item.slug}`}>
                          <img
                            src={item.image || '/placeholder-shoe.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                          />
                        </Link>
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/product/${item.slug}`}
                          className="font-cormorant text-white text-2xl hover:text-fm-gold transition-colors block mb-2"
                        >
                          {item.name}
                        </Link>
                        <div className="text-fm-muted text-sm font-jost space-y-1 tracking-wider">
                          {item.size && <p>Size: <span className="text-fm-text">{item.size} (EU)</span></p>}
                          {item.color && <p>Color: <span className="text-fm-text capitalize">{item.color}</span></p>}
                        </div>
                        <button
                          onClick={() => handleRemove(item.productId, item.size, item.color)}
                          className="mt-4 text-fm-muted hover:text-red-400 text-xs uppercase tracking-widest font-jost flex items-center gap-2 transition-colors group"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3 flex justify-between sm:justify-center items-center w-full sm:w-auto">
                      <span className="sm:hidden text-fm-muted text-xs uppercase tracking-widest font-jost">Quantity:</span>
                      <div className="flex items-center border border-fm-border bg-fm-surface h-10 w-32">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex-1 h-full text-fm-muted hover:text-white disabled:opacity-30 transition-colors flex items-center justify-center text-xl font-jost"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-white text-sm font-jost">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.size, item.color, item.quantity + 1)}
                          className="flex-1 h-full text-fm-muted hover:text-white transition-colors flex items-center justify-center text-xl font-jost"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price Total */}
                    <div className="col-span-3 flex justify-between sm:justify-end items-center w-full sm:w-auto">
                      <span className="sm:hidden text-fm-muted text-xs uppercase tracking-widest font-jost">Total:</span>
                      <span className="text-fm-gold font-cormorant font-semibold text-2xl">
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
            <div className="bg-fm-surface border border-fm-border p-6 md:p-8 sticky top-32 shadow-2xl">
              <h2 className="font-cormorant text-white text-3xl mb-8">Summary</h2>
              
              <div className="space-y-4 font-jost text-sm border-b border-fm-border pb-6">
                <div className="flex justify-between items-center text-fm-muted">
                  <span>Subtotal</span>
                  <span className="text-fm-text">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-fm-muted">
                  <span>Shipping</span>
                  <span className={delivery === 0 ? 'text-fm-success' : 'text-fm-text'}>
                    {delivery === 0 ? 'FREE' : formatPKR(delivery)}
                  </span>
                </div>
                {delivery > 0 && (
                  <div className="bg-fm-gold/10 border border-fm-gold/20 text-fm-gold px-4 py-3 text-xs tracking-wider">
                    Add {formatPKR(5000 - subtotal)} more for free delivery.
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-end pt-6 mb-10">
                <span className="font-cormorant text-white text-2xl">Total</span>
                <div className="text-right">
                  <span className="text-fm-gold font-bold text-3xl block leading-none">{formatPKR(total)}</span>
                  <span className="text-fm-muted text-[10px] uppercase tracking-widest block mt-2">VAT Included</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-gold w-full py-4 text-base shadow-[0_0_20px_rgba(201,168,76,0.15)] hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]"
              >
                Secure Checkout
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-3 text-fm-muted text-[10px] uppercase tracking-[0.2em] font-jost">
                <svg className="w-4 h-4 text-fm-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL Secured Payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
