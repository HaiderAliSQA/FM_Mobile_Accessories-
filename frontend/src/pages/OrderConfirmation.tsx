import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetOrderByNumberQuery } from '../store/api/ordersApi';
import { formatPrice } from '../utils/formatPrice';

const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: result, isLoading, isError } = useGetOrderByNumberQuery(orderNumber || '', {
    skip: !orderNumber,
    refetchOnMountOrArgChange: true
  });

  const order = result?.data;

  // Extract first name for personalized Urdu greeting
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'CUSTOMER';
    const cleanName = fullName.trim().replace(/^(mr\.|ms\.|hafiz|muhammad|ch)\s+/i, '');
    const first = cleanName.split(' ')[0].toUpperCase();
    return first || 'CUSTOMER';
  };

  // Format creation date: e.g. 19 May 2026, 10:15 am
  const getFormattedDate = (createdAtStr: string) => {
    const d = createdAtStr ? new Date(createdAtStr) : new Date();
    return d.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ', ' + d.toLocaleTimeString('en-PK', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  // Calculate dynamic TCS 2-day delivery window
  const getEstimatedDelivery = (createdAtStr: string) => {
    const createdDate = createdAtStr ? new Date(createdAtStr) : new Date();
    
    const startEst = new Date(createdDate);
    startEst.setDate(startEst.getDate() + 2);
    
    const endEst = new Date(createdDate);
    endEst.setDate(endEst.getDate() + 3);
    
    const formatDate = (d: Date) => d.toLocaleDateString('en-PK', { day: 'numeric' });
    const formatMonthYear = (d: Date) => d.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
    
    return `${formatDate(startEst)}–${formatDate(endEst)} ${formatMonthYear(startEst)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric/20 border-t-electric rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8">
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-heading text-white text-3xl font-extrabold uppercase italic">Order Not Found</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
            This order number is invalid or has not been processed yet.
          </p>
          <Link to="/" className="btn-electric px-10 py-4 font-extrabold rounded-2xl block">Return to Home</Link>
        </div>
      </div>
    );
  }

  const formattedDate = getFormattedDate(order.createdAt ? String(order.createdAt) : '');
  const deliveryRange = getEstimatedDelivery(order.createdAt ? String(order.createdAt) : '');
  const firstName = getFirstName(order.ownerName || '');

  return (
    <div className="min-h-screen bg-navy-dark pt-32 pb-20 px-4">
      {/* Dynamic Embedded Premium Animations */}
      <style>{`
        .check-circle {
          animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .check-path {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: drawCheck 0.5s ease-in-out 0.4s forwards;
        }
        @keyframes scaleUp {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @media print {
          .no-print { display: none !important; }
          .print-card {
            background: #111b27 !important;
            border: 1px solid rgba(255,255,255,0.05) !important;
            box-shadow: none !important;
          }
          body {
            background: #0a1118 !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Shukriya Hero Header */}
        <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-glow-blue/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-electric/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          {/* Glowing Animated Success Checkmark */}
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 check-circle shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path className="check-path" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Personalized Shukriya Greetings */}
          <h1 className="font-heading text-white text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">
            SHUKRIYA {firstName} BHAI!
          </h1>
          <p className="text-electric text-[11px] font-extrabold uppercase tracking-[0.25em] mb-4">
            Order Placed Successfully
          </p>
          <p className="text-gray-400 text-xs md:text-sm font-medium tracking-wide max-w-lg mx-auto leading-relaxed border-t border-white/5 pt-4">
            Aapka order receive ho gaya — hum jald dispatch karein ge. Niche di gayi details check kar lein.
          </p>
          
          {/* Confirmation Meta Details */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8 p-5 bg-navy-dark/50 border border-white/5 rounded-2xl">
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Confirmation Number</p>
              <p className="text-white font-extrabold text-sm tracking-tight">{order.orderId}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Order Date</p>
              <p className="text-white font-extrabold text-sm tracking-tight">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Purchase Summary Table */}
        <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
          <h3 className="font-heading text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-4">
            Review Items
          </h3>
          <div className="divide-y divide-white/5">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-6 items-center py-5 first:pt-0 last:pb-0">
                <div className="w-16 h-16 bg-navy-dark rounded-xl border border-white/5 p-2 shrink-0 flex items-center justify-center">
                  <img src={item.image || '/placeholder-product.png'} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white uppercase truncate">{item.name}</h4>
                  <div className="flex gap-3 mt-1 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>QTY: {item.quantity}</span>
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-white">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-[9px] text-gray-600 font-medium uppercase mt-0.5">{formatPrice(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculations */}
          <div className="pt-6 border-t border-white/5 space-y-3 max-w-sm ml-auto">
            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Subtotal Summary</span>
              <span className="text-white font-extrabold">
                {formatPrice(order.subtotal)}
                {(order.deliveryFee ?? 0) > 0 && <span className="text-[9px] text-gray-600 lowercase ml-1"> + {formatPrice(order.deliveryFee ?? 0)} tcs</span>}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-black text-white uppercase tracking-tight mt-4 pt-4 border-t border-white/5">
              <span>Grand Total</span>
              <span className="text-electric font-black text-xl">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 2x2 Grid Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Logistics block */}
          <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-4 text-electric">
              <span className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center text-lg shadow-glow-blue/5">🚚</span>
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">TCS Express Delivery</h3>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-white tracking-tight">{deliveryRange}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-relaxed">
                AAPKA PARCEL TCS COURIER KE ZARIYE DELIVER HOGA. TRACKING NUMBER DISPATCH KE BAAD WHATSAPP PER BHEJA JAEGA.
              </p>
            </div>
          </div>

          {/* Shipping Address Block */}
          <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-4 text-electric">
              <span className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center text-lg shadow-glow-blue/5">📍</span>
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">Shipping Address</h3>
            </div>
            <div className="space-y-3 text-[11px] font-bold uppercase tracking-wider">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Name</span>
                <span className="text-white">{order.ownerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Phone</span>
                <span className="text-white">{order.phone}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">City</span>
                <span className="text-white">{order.city}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Shop Name</span>
                <span className="text-white text-right max-w-[200px] truncate">{order.shopName}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Block */}
          <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-electric">
                <span className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center text-lg shadow-glow-blue/5">💵</span>
                <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">Payment</h3>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-white tracking-tight">CASH ON DELIVERY</p>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">STATUS: PENDING</p>
              </div>
            </div>
            <div className="p-4 bg-navy-dark border border-white/5 rounded-2xl mt-4">
              <p className="text-[10px] text-electric font-semibold uppercase tracking-wider text-center leading-relaxed italic">
                "PKR {order.totalAmount.toLocaleString()} cash tayar rakhein delivery ke waqt."
              </p>
            </div>
          </div>

          {/* Concierge Support Block */}
          <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-4 text-electric">
              <span className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center text-lg shadow-glow-blue/5">☎️</span>
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">Concierge</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                ORDER ASSISTANCE IS AVAILABLE 24/7.
              </p>
              <div className="grid grid-cols-2 gap-3 font-heading">
                <a 
                  href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '923007002061'}?text=Assalam-o-Alaikum, order ID *${order.orderId}* details check kar lein.`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] text-center border border-emerald-500/20 transition-all"
                >
                  WhatsApp Inquiry
                </a>
                <a 
                  href="tel:+923007002061" 
                  className="bg-electric/10 hover:bg-electric/20 text-electric py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] text-center border border-electric/20 transition-all"
                >
                  Direct Call
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Global Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 no-print">
          <Link 
            to="/" 
            className="flex-1 bg-navy-mid hover:bg-navy-mid/80 text-white font-heading font-black uppercase tracking-widest text-[10px] py-4.5 rounded-2xl text-center border border-white/5 transition-all shadow-glow-blue/5"
          >
            Continue Shopping
          </Link>
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-electric hover:bg-electric-light text-navy-dark font-heading font-black uppercase tracking-widest text-[10px] py-4.5 rounded-2xl text-center shadow-glow-blue transition-all"
          >
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
