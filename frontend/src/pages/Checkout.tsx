import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '../hooks/useCart';
import { usePlaceOrderMutation } from '../store/api/ordersApi';

const pkPhoneRegex = /^03\d{9}$/;

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().regex(pkPhoneRegex, 'Must be a valid 11-digit Pakistani mobile number starting with 03 (e.g., 03237893801)'),
  shippingAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    zipCode: z.string().min(3, 'Postal code is required'),
    country: z.literal('Pakistan', {
      errorMap: () => ({ message: 'Shipping is currently limited to Pakistan' }),
    }),
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryCharges, total } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer'>('cod');
  const [placeOrder, { isLoading, error }] = usePlaceOrderMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        country: 'Pakistan',
      },
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const orderData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.shippingAddress.street,
        customerCity: data.shippingAddress.city,
        customerPostalCode: data.shippingAddress.zipCode,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          color: item.color,
          price: Number(item.price),
        })),
        total,
        subtotal,
        deliveryCharges,
      };

      const result = await placeOrder(orderData).unwrap();
      
      if (result.success && result.data?.order) {
        navigate(`/order-confirmation/${result.data.order.orderNumber}`);
      }
    } catch (err: any) {
      console.error('Failed to place order:', err);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-navy-dark pt-24 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Stepper */}
        <div className="flex flex-col items-center mb-12 md:mb-20">
          <h1 className="font-heading text-white text-3xl md:text-5xl font-extrabold uppercase tracking-tighter italic mb-6">Secure <span className="text-electric">Checkout</span></h1>
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] uppercase">
            <span className="text-white">Shipping</span>
            <div className="w-8 h-0.5 bg-electric"></div>
            <span className="text-gray-600">Confirmation</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Panel: Form */}
          <div className="w-full lg:w-[60%] space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Information Section */}
              <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10">
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center font-heading text-lg font-extrabold border border-electric/20 shadow-glow-blue/10">1</span>
                  <h2 className="text-xl font-heading font-extrabold text-white uppercase tracking-tight">Contact Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      {...register('customerEmail')}
                      placeholder="e.g. user@gmail.com"
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.customerEmail && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.customerEmail.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Mobile Number (Pakistan)</label>
                    <input
                      {...register('customerPhone')}
                      placeholder="e.g. 03237893801"
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.customerPhone && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.customerPhone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Section */}
              <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10">
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center font-heading text-lg font-extrabold border border-electric/20 shadow-glow-blue/10">2</span>
                  <h2 className="text-xl font-heading font-extrabold text-white uppercase tracking-tight">Shipping Location</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      {...register('customerName')}
                      placeholder="Receiver's name"
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.customerName && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Complete Address</label>
                    <input
                      {...register('shippingAddress.street')}
                      placeholder="House, Street, Area info"
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.shippingAddress?.street && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.shippingAddress.street.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">City</label>
                      <input
                        {...register('shippingAddress.city')}
                        placeholder="e.g. Karachi"
                        className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Province/State</label>
                      <input
                        {...register('shippingAddress.state')}
                        placeholder="Province"
                        className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10">
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center font-heading text-lg font-extrabold border border-electric/20 shadow-glow-blue/10">3</span>
                  <h2 className="text-xl font-heading font-extrabold text-white uppercase tracking-tight">Payment Method</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Secure doorstep payment' },
                    { id: 'jazzcash', label: 'JazzCash', desc: 'Instant mobile wallet' },
                    { id: 'easypaisa', label: 'Easypaisa', desc: 'Instant authorization' },
                    { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Manual deposit details' }
                  ].map((method) => (
                    <label 
                      key={method.id}
                      className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        paymentMethod === method.id ? 'border-electric bg-electric/5 shadow-glow-blue/10' : 'border-white/5 bg-navy-dark hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-extrabold uppercase tracking-[0.2em] transition-colors ${paymentMethod === method.id ? 'text-white' : 'text-gray-500'}`}>{method.label}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method.id ? 'border-electric bg-electric' : 'border-white/10 bg-transparent'}`}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-navy-mid rounded-full" />}
                        </div>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          className="hidden"
                          checked={paymentMethod === method.id} 
                          onChange={() => setPaymentMethod(method.id as any)}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{method.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-6 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest rounded-2xl border border-red-500/20 flex items-center gap-4">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{(error as any)?.data?.message || 'Transaction failed. Please verify your details.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-electric text-white py-6 rounded-[2rem] text-sm font-extrabold uppercase tracking-[0.4em] transition-all hover:shadow-glow-blue active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-4 animate-pulse-glow"
              >
                {isLoading ? (
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Complete Purchase • PKR {total.toLocaleString()}</>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Order Summary */}
          <div className="w-full lg:w-[40%] bg-navy-mid/50 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-12 animate-fade-in-right sticky top-32">
            <h2 className="font-heading text-xl font-extrabold text-white uppercase tracking-tight italic border-b border-white/5 pb-6">Your Order</h2>
            
            <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
              {items.map((item: any) => (
                <div key={`${item.productId}-${item.color || 'nocolor'}`} className="flex gap-6 group">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 bg-navy-dark rounded-xl border border-white/5 p-2 flex items-center justify-center group-hover:border-electric/40 transition-colors">
                       <img src={item.image} alt={item.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-electric text-white font-heading text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-navy-mid">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xs text-white font-bold uppercase tracking-wide leading-tight group-hover:text-electric transition-colors">{item.name}</h3>
                    {item.color && <p className="text-[9px] font-extrabold text-gray-600 uppercase tracking-[0.2em]">{item.color}</p>}
                    <p className="text-sm font-extrabold text-electric mt-2">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-10 border-t border-white/5">
              <div className="flex justify-between items-center text-[11px] font-extrabold text-gray-500 tracking-[0.3em] uppercase">
                <span>Value</span>
                <span className="text-white text-base">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-extrabold text-gray-500 tracking-[0.3em] uppercase">
                <span>Shipping TCS</span>
                <span className="text-white text-base">
                  {deliveryCharges === 0 ? 'FREE' : `PKR ${deliveryCharges.toLocaleString()}`}
                </span>
              </div>
              
              <div className="pt-8 flex justify-between items-end border-t border-white/5">
                <span className="font-heading text-white text-lg font-extrabold uppercase italic tracking-tighter">Total Due</span>
                <div className="text-right">
                    <span className="text-white font-extrabold text-4xl block leading-none tracking-tighter italic">PKR {total.toLocaleString()}</span>
                    <span className="text-gray-700 text-[9px] font-extrabold uppercase tracking-[0.3em] block mt-3 italic text-right">Tax Included</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-navy-dark rounded-3xl border border-white/5 flex flex-col items-center gap-4 text-center">
              <div className="flex gap-4">
                  <span className="text-xl">🛡️</span>
                  <span className="text-xl">🚚</span>
                  <span className="text-xl">✅</span>
              </div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                Official FM Mobile Accessories Store • Secure Payment Gateway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
