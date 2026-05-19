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
    <div className="min-h-screen bg-navy-dark pt-20 sm:pt-24 pb-10 px-4">
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
        .btn-animated-pulse {
          animation: pulseGlow 2s infinite alternate;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-animated-pulse:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 25px rgba(14, 165, 233, 0.8) !important;
        }
        .btn-animated-pulse:active {
          transform: translateY(1px) scale(0.98);
        }
        
        .btn-continue-animated {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-continue-animated:hover {
          transform: translateY(-2px) scale(1.02);
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .btn-continue-animated:active {
          transform: translateY(1px) scale(0.98);
        }
        
        @keyframes scaleUp {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
          }
          100% {
            box-shadow: 0 0 18px rgba(14, 165, 233, 0.7);
          }
        }
        @media print {
          /* Hide all non-essential web and interactive features */
          nav, header, footer, .no-print, [class*="Navbar"], [class*="Footer"], [class*="PromoBar"], [class*="WhatsAppWidget"], [class*="whatsApp"], [class*="whatsapp"] {
            display: none !important;
          }
          
          /* Full Page Reset for standard paper print */
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Compress overall outer container spacing */
          .min-h-screen {
            min-height: 0 !important;
            padding: 10px !important;
            background: #ffffff !important;
          }
          
          .max-w-4xl {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .space-y-4 > * + * {
            margin-top: 8px !important;
          }
          
          /* Elegant Ink-Saving Cards & Borders */
          .bg-navy-mid {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            padding: 12px !important;
            box-shadow: none !important;
          }
          
          .bg-navy-dark\/50 {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }
          
          .border-white\/5 {
            border-color: #e2e8f0 !important;
          }
          
          .divide-white\/5 > * + * {
            border-color: #e2e8f0 !important;
          }
          
          /* Force standard dark ink colors */
          h1, h2, h3, h4, .text-white {
            color: #000000 !important;
          }
          
          .text-gray-400, .text-gray-500, .text-gray-600 {
            color: #475569 !important;
          }
          
          .text-electric {
            color: #0f172a !important;
            font-weight: 800 !important;
          }
          
          .bg-navy-dark {
            background: #f1f5f9 !important;
            border: 1px solid #e2e8f0 !important;
          }
          
          .border-t {
            border-top-color: #e2e8f0 !important;
          }
          .border-b {
            border-bottom-color: #e2e8f0 !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Print-Only Premium Invoice Header */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-2">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center">
              <span className="text-slate-800 mr-1.5">FH</span> Mobile Accessories
            </h1>
            <p className="text-[9px] text-slate-600 font-extrabold uppercase tracking-[0.2em]">Wholesale Store</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">ORDER INVOICE</h2>
            <p className="text-[8px] text-slate-500 font-bold uppercase">Customer & Shop Copy</p>
          </div>
        </div>

        {/* Shukriya Hero Header */}
        <div className="bg-navy-mid border border-white/5 rounded-3xl p-5 md:p-8 text-center relative overflow-hidden shadow-glow-blue/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-electric/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          {/* Glowing Animated Success Checkmark */}
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 check-circle shadow-[0_0_20px_rgba(16,185,129,0.1)] no-print">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path className="check-path" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Personalized Shukriya Greetings */}
          <h1 className="font-heading text-white text-2xl md:text-4xl font-black uppercase tracking-tight mb-1">
            SHUKRIYA {firstName} BHAI!
          </h1>
          <p className="text-electric text-[10px] font-extrabold uppercase tracking-[0.25em] mb-2">
            Order Placed Successfully
          </p>
          <p className="text-gray-400 text-xs md:text-sm font-medium tracking-wide max-w-lg mx-auto leading-relaxed border-t border-white/5 pt-3 no-print">
            Aapka order receive ho gaya — hum jald dispatch karein ge. Niche di gayi details check kar lein.
          </p>
          
          {/* Confirmation Meta Details */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-4 p-4 bg-navy-dark/50 border border-white/5 rounded-2xl">
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Confirmation Number</p>
              <p className="text-white font-extrabold text-sm tracking-tight">{order.orderId}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Order Date</p>
              <p className="text-white font-extrabold text-sm tracking-tight">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Purchase Summary Table */}
        <div className="bg-navy-mid border border-white/5 rounded-3xl p-5 md:p-8 space-y-4">
          <h3 className="font-heading text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2.5">
            Review Items
          </h3>
          <div className="divide-y divide-white/5">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-center py-3 first:pt-0 last:pb-0">
                <div className="w-14 h-14 bg-navy-dark rounded-xl border border-white/5 p-1.5 shrink-0 flex items-center justify-center">
                  <img src={item.image || '/placeholder-product.png'} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white uppercase truncate">{item.name}</h4>
                  <div className="flex gap-3 mt-0.5 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
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
          <div className="pt-4 border-t border-white/5 space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Subtotal Summary</span>
              <span className="text-white font-extrabold">
                {formatPrice(order.subtotal)}
                {(order.deliveryFee ?? 0) > 0 && <span className="text-[9px] text-gray-600 lowercase ml-1"> + {formatPrice(order.deliveryFee ?? 0)} tcs</span>}
              </span>
            </div>
            <div className="flex justify-between items-center text-base font-black text-white uppercase tracking-tight mt-2 pt-2 border-t border-white/5">
              <span>Grand Total</span>
              <span className="text-electric font-black text-lg">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 2x2 Grid Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Logistics block */}
          <div className="bg-navy-mid border border-white/5 rounded-3xl p-5 md:p-6 space-y-3 no-print">
            <div className="flex items-center gap-3 text-electric">
              <span className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-sm shadow-glow-blue/5">🚚</span>
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">TCS Express Delivery</h3>
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-white tracking-tight">{deliveryRange}</p>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider leading-relaxed">
                AAPKA PARCEL TCS COURIER KE ZARIYE DELIVER HOGA. TRACKING NUMBER DISPATCH KE BAAD WHATSAPP PER BHEJA JAEGA.
              </p>
            </div>
          </div>

          {/* Shipping Address Block */}
          <div className="bg-navy-mid border border-white/5 rounded-3xl p-5 md:p-6 space-y-3">
            <div className="flex items-center gap-3 text-electric">
              <span className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-sm shadow-glow-blue/5">📍</span>
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">Shipping Address</h3>
            </div>
            <div className="space-y-2 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-gray-500">Name</span>
                <span className="text-white">{order.ownerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-gray-500">Phone</span>
                <span className="text-white">{order.phone}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-gray-500">City</span>
                <span className="text-white">{order.city}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-gray-500">Shop Name</span>
                <span className="text-white text-right max-w-[200px] truncate">{order.shopName}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Block */}
          <div className="bg-navy-mid border border-white/5 rounded-3xl p-5 md:p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-electric">
                <span className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-sm shadow-glow-blue/5">💵</span>
                <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">Payment</h3>
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-white tracking-tight">CASH ON DELIVERY</p>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">STATUS: PENDING</p>
              </div>
            </div>
            <div className="p-3 bg-navy-dark border border-white/5 rounded-xl mt-2">
              <p className="text-[9px] text-electric font-semibold uppercase tracking-wider text-center leading-relaxed italic">
                "PKR {order.totalAmount.toLocaleString()} cash tayar rakhein delivery ke waqt."
              </p>
            </div>
          </div>

          {/* Concierge Support Block */}
          <div className="bg-navy-mid border border-white/5 rounded-3xl p-5 md:p-6 space-y-3 no-print">
            <div className="flex items-center gap-3 text-electric">
              <span className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-sm shadow-glow-blue/5">☎️</span>
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-widest">Concierge</h3>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                ORDER ASSISTANCE IS AVAILABLE 24/7.
              </p>
              <div className="grid grid-cols-2 gap-2 font-heading">
                <a 
                  href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '923007002061'}?text=Assalam-o-Alaikum, order ID *${order.orderId}* details check kar lein.`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2.5 rounded-xl font-black uppercase tracking-widest text-[8px] text-center border border-emerald-500/20 transition-all"
                >
                  WhatsApp Inquiry
                </a>
                <a 
                  href="tel:+923007002061" 
                  className="bg-electric/10 hover:bg-electric/20 text-electric py-2.5 rounded-xl font-black uppercase tracking-widest text-[8px] text-center border border-electric/20 transition-all"
                >
                  Direct Call
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Global Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 no-print">
          <Link 
            to="/" 
            className="btn-continue-animated flex-1 bg-navy-mid text-white font-heading font-black uppercase tracking-widest text-xs sm:text-sm py-4.5 sm:py-5 rounded-2xl text-center border border-white/5 shadow-glow-blue/5"
          >
            Continue Shopping
          </Link>
          <button 
            onClick={() => window.print()}
            className="btn-animated-pulse flex-1 bg-electric text-navy-dark font-heading font-black uppercase tracking-widest text-xs sm:text-sm py-4.5 sm:py-5 rounded-2xl text-center shadow-glow-blue"
          >
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
