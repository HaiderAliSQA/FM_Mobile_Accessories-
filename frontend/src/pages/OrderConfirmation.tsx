import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useGetOrderByNumberQuery } from '../store/api/ordersApi';

const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { clearCart } = useCart();

  const { data: result, isLoading, isError } = useGetOrderByNumberQuery(orderNumber || '', {
    skip: !orderNumber,
    refetchOnMountOrArgChange: true
  });

  const order = result?.data;

  useEffect(() => {
    clearCart();
  }, [clearCart]);

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
        <div className="max-w-md space-y-8 animate-fade-in">
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

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return (
    <div className="min-h-screen bg-navy-dark pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Success Hero */}
        <div className="bg-navy-mid border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-glow-blue/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-electric/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="w-24 h-24 bg-electric rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-glow-blue animate-pulse-glow">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="font-heading text-white text-4xl md:text-6xl font-extrabold uppercase tracking-tighter italic mb-4">
            Order <span className="text-electric">Confirmed</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-extrabold uppercase tracking-[0.4em] mb-10 italic">
            Thank you for choosing FH Mobile Accessories
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/5 font-heading">
            <div>
              <p className="text-[10px] text-gray-600 font-extrabold uppercase tracking-widest mb-2">Order ID</p>
              <p className="text-white font-bold text-lg tracking-tighter">#{order.orderNumber ? order.orderNumber.replace(/^KM-/, 'FH-') : ''}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-600 font-extrabold uppercase tracking-widest mb-2">Status</p>
              <p className="text-electric font-bold text-lg uppercase">Confirmed</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 font-extrabold uppercase tracking-widest mb-2">Expected By</p>
              <p className="text-white font-bold text-lg">{deliveryDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600 font-extrabold uppercase tracking-widest mb-2">Method</p>
              <p className="text-white font-bold text-lg uppercase">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Order Details */}
          <div className="md:col-span-7 bg-navy-mid border border-white/5 rounded-[3rem] p-10 space-y-8">
            <h3 className="font-heading text-xl font-extrabold text-white uppercase italic tracking-tight border-b border-white/5 pb-6">Purchase Summary</h3>
            <div className="space-y-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-navy-dark rounded-xl border border-white/5 p-2 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white uppercase truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-600 font-extrabold uppercase tracking-widest mt-1">QTY: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-extrabold text-white">PKR {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Shipping Fee</span>
                <span className="text-white">{order.deliveryCharges === 0 ? 'FREE' : `PKR ${order.deliveryCharges}`}</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-white uppercase italic tracking-tighter mt-4">
                <span>Total Amount</span>
                <span className="text-electric">PKR {order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Logistics & Support */}
          <div className="md:col-span-5 space-y-8">
            <div className="bg-navy-mid border border-white/5 rounded-[3rem] p-8 space-y-6">
              <div className="flex items-center gap-4 text-electric">
                 <span className="text-2xl">🚚</span>
                 <h3 className="font-heading text-lg font-extrabold text-white uppercase italic">Shipping Via TCS</h3>
              </div>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                Your order will be dispatched within 24 hours. A tracking number will be sent to your mobile number via SMS/WhatsApp.
              </p>
            </div>

            <div className="bg-electric rounded-[3rem] p-10 text-center space-y-6 shadow-glow-blue animate-pulse-glow">
              <h3 className="font-heading text-xl font-extrabold text-white uppercase italic">Need Assistance?</h3>
              <p className="text-[10px] text-white/70 font-extrabold uppercase tracking-[0.2em]">Contact our Concierge</p>
              <div className="flex flex-col gap-3 font-heading">
                <a href="https://wa.me/923017967300" className="bg-navy-mid text-black py-4 rounded-2xl font-extrabold uppercase tracking-widest text-xs hover:bg-gray-100 transition-all">WhatsApp Us</a>
                <Link to="/" className="text-white text-[10px] font-extrabold uppercase tracking-[0.3em] py-2">Continue Shopping</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
