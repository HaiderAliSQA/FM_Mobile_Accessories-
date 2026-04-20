import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useGetOrderByNumberQuery } from '../store/api/ordersApi';

const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { clearCart } = useCart();

  // Use RTK Query instead of manual axios
  const { data: result, isLoading, isError } = useGetOrderByNumberQuery(orderNumber || '', {
    skip: !orderNumber,
    refetchOnMountOrArgChange: true
  });

  const order = result?.data;

  useEffect(() => {
    // Clear cart on mount
    clearCart();
  }, [clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1A1A1A]/60 font-dm uppercase tracking-widest text-xs">Order detail fetch ho rahi hai...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#E8E0D0] p-10 text-center shadow-xl">
          <div className="w-20 h-20 bg-red-50 text-[#D23F57] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-playfair text-3xl text-[#1A1A1A] mb-4 font-bold uppercase tracking-tight">Order Nahi Mila</h1>
          <p className="text-[#1A1A1A]/60 font-dm mb-8 leading-relaxed text-sm tracking-wide">
            Ye order number invalid hai ya order abhi tak save nahi hua. Barae meharbani link check karein.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#1A1A1A] text-white px-10 py-5 font-dm text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-all shadow-lg"
          >
            Home pe wapis jayein
          </Link>
        </div>
      </div>
    );
  }

  // Calculate delivery estimate (Order Date + 2-3 days)
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const deliveryStart = new Date(orderDate);
  deliveryStart.setDate(orderDate.getDate() + 2);
  const deliveryEnd = new Date(orderDate);
  deliveryEnd.setDate(orderDate.getDate() + 3);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header / Success Animation */}
        <div className="bg-white border border-[#E8E0D0] shadow-sm mb-8 overflow-hidden">
          <div className="bg-green-50/50 py-10 text-center border-b border-[#E8E0D0] relative">
            <div className="w-20 h-20 bg-white border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-playfair text-[28px] md:text-4xl text-[#1A1A1A] font-bold uppercase tracking-tight mb-2">
              Shukriya {(order.customerName || '').split(' ')[0]} Bhai!
            </h1>
            <p className="text-green-700 font-dm text-[10px] uppercase tracking-[0.3em] font-black">
              Order Placed Successfully
            </p>
          </div>

          <div className="p-8 sm:p-12 text-center border-b border-[#E8E0D0] bg-[#FAF9F6]">
            <p className="text-[#1A1A1A]/70 font-dm text-sm leading-relaxed mb-6 max-w-md mx-auto italic">
              Aapka order receive ho gaya — hum jald dispatch karein ge. Niche di gayi details check kar lein.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-12">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9C9890] font-bold mb-1">Confirmation Number</p>
                <p className="font-dm text-lg font-bold text-[#1A1A1A] tracking-tighter">{order.orderNumber}</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-[#E8E0D0] self-center"></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#9C9890] font-bold mb-1">Order Date</p>
                <p className="font-dm text-sm font-semibold text-[#1A1A1A]">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString('en-PK', { 
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true 
                  }) : 'Processing...'}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-8 sm:p-12">
            <h3 className="font-playfair text-xl text-[#1A1A1A] font-black mb-6 border-b border-[#E8E0D0] pb-4 uppercase tracking-widest">
              Review Items
            </h3>
            <div className="space-y-6">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex gap-6 pb-6 border-b border-[#E8E0D0] last:border-0 last:pb-0 group">
                  <div className="w-20 h-20 bg-[#FAF9F6] border border-[#E8E0D0] rounded-sm flex-shrink-0 overflow-hidden group-hover:border-[#C9A84C] transition-colors">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain mix-blend-multiply p-1 transition-transform group-hover:scale-110 duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-playfair text-[#1A1A1A] font-bold truncate tracking-wide uppercase text-sm">{item.name}</h4>
                    <p className="text-[10px] text-[#1A1A1A]/40 mt-1 font-dm uppercase tracking-widest font-black">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-[#1A1A1A] font-bold mt-2 font-dm text-[13px] tracking-widest">
                      PKR {(item.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="mt-10 pt-8 border-t-2 border-[#1A1A1A] bg-[#FAF9F6] p-8 rounded-sm shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]/40">SUBTOTAL SUMMARY</span>
                <span className="text-xs font-dm text-[#1A1A1A]/70 font-bold">
                  PKR {(order.subtotal || 0).toLocaleString()} + {(order.deliveryCharges || 0).toLocaleString()} S&H
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-playfair font-black text-[#1A1A1A] uppercase tracking-widest">GRAND TOTAL</span>
                <span className="text-3xl font-playfair font-black text-[#1A1A1A] tracking-tighter">
                  PKR {(order.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-[#E8E0D0] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-[#C9A84C]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-playfair text-lg text-[#1A1A1A] font-black uppercase tracking-wider">TCS EXPRESS DELIVERY</h3>
            </div>
            <p className="text-2xl font-playfair font-bold text-[#1A1A1A] mb-3 tracking-tight">
              {deliveryStart.getDate()}–{deliveryEnd.getDate()} {deliveryEnd.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-[#1A1A1A]/50 text-[11px] font-dm leading-relaxed tracking-wider uppercase font-bold">
              Aapka parcel TCS courier ke zariye deliver hoga. Tracking number dispatch ke baad WhatsApp pe bheja jaega.
            </p>
          </div>

          <div className="bg-white border border-[#E8E0D0] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-[#C9A84C]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="font-playfair text-lg text-[#1A1A1A] font-black uppercase tracking-wider">SHIPPING ADDRESS</h3>
            </div>
            <div className="space-y-3 text-[11px] font-dm tracking-[0.2em] font-bold uppercase">
              <p className="flex justify-between border-b border-[#E8E0D0]/50 pb-2">
                <span className="text-[#9C9890]">Name</span>
                <span className="text-[#1A1A1A] text-right">{order.customerName}</span>
              </p>
              <p className="flex justify-between border-b border-[#E8E0D0]/50 pb-2">
                <span className="text-[#9C9890]">Phone</span>
                <span className="text-[#1A1A1A] text-right">{order.customerPhone}</span>
              </p>
              <p className="flex justify-between border-b border-[#E8E0D0]/50 pb-2">
                <span className="text-[#9C9890]">City</span>
                <span className="text-[#1A1A1A] text-right">{order.customerCity}</span>
              </p>
              <p className="flex flex-col gap-1">
                <span className="text-[#9C9890]">Full Address</span>
                <span className="text-[#1A1A1A] normal-case leading-relaxed font-medium">{order.customerAddress}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment and Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1A1A1A] text-white p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#C9A84C]/10 rounded-full transition-transform group-hover:scale-150 duration-700"></div>
            
            <h3 className="font-playfair text-lg text-[#C9A84C] font-black uppercase tracking-[0.2em] mb-8">PAYMENT</h3>
            <div className="mb-8">
              <p className="text-xl font-dm font-black tracking-[0.2em] uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : (order.paymentMethod || '').toUpperCase()}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] mt-1 font-black">Status: {(order.paymentStatus || 'pending').toUpperCase()}</p>
            </div>
            <div className="p-5 bg-white/5 border border-white/10 rounded-sm italic">
              <p className="text-[11px] leading-relaxed text-[#C9A84C] font-bold tracking-wider">
                PKR {(order.totalAmount || 0).toLocaleString()} cash tayar rakhein delivery ke waqt.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E8E0D0] p-10 shadow-sm flex flex-col justify-center">
            <h3 className="font-playfair text-lg text-[#1A1A1A] font-black uppercase tracking-wider mb-2">CONCIERGE</h3>
            <p className="text-[10px] text-[#9C9890] font-dm mb-8 tracking-[0.2em] uppercase font-bold italic">Order assistance is available 24/7</p>
            
            <div className="space-y-4 font-dm font-bold text-[11px] tracking-[0.3em] uppercase text-center">
              <a 
                href="https://wa.me/923007002061" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-5 border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white transition-all transform active:scale-95"
              >
                WhatsApp Inquiry
              </a>
              <a 
                href="tel:+923007002061" 
                className="block w-full py-5 bg-[#FAF9F6] border border-[#E8E0D0] text-[#1A1A1A]/70 hover:border-[#1A1A1A] transition-all"
              >
                Direct Call
              </a>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-20">
          <Link
            to="/"
            className="flex-1 bg-[#1A1A1A] text-white text-center py-6 font-black font-dm text-[11px] uppercase tracking-[0.4em] hover:bg-black hover:shadow-2xl transition-all"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-white border border-[#1A1A1A] text-[#1A1A1A] py-6 font-black font-dm text-[11px] uppercase tracking-[0.4em] hover:bg-[#FAF9F6] transition-all"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
