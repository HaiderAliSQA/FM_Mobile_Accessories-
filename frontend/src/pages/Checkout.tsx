// frontend/src/pages/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '../hooks/useCart';
import { usePlaceOrderMutation } from '../store/api/ordersApi';
import { formatPrice } from '../utils/formatPrice';

/**
 * Validates a Pakistani mobile number.
 * Must start with 03 and be exactly 11 digits long.
 */
const pkPhoneRegex = /^03\d{9}$/;

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().regex(pkPhoneRegex, 'Must be a valid 11-digit Pakistani mobile number starting with 03 (e.g., 03001234567)'),
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

  // Redirect to cart if empty
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
    <div className="min-h-screen bg-white pt-20 md:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        
        {/* Progress Header */}
        <div className="flex flex-col items-center mb-10 md:mb-16 animate-fadeIn">
          <h1 className="font-playfair text-[24px] md:text-[42px] font-bold text-fm-text tracking-tight mb-4 uppercase">CHECKOUT</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="font-dm text-[9px] md:text-[11px] font-bold tracking-[0.2em] text-fm-text">01 BAG</span>
            <div className="w-6 md:w-8 h-px bg-fm-gold"></div>
            <span className="font-dm text-[9px] md:text-[11px] font-bold tracking-[0.2em] text-fm-text">02 SHIPPING</span>
            <div className="w-6 md:w-8 h-px bg-fm-border"></div>
            <span className="font-dm text-[9px] md:text-[11px] font-bold tracking-[0.2em] text-fm-text-3">03 CONFIRMATION</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left Panel: Form */}
          <div className="w-full lg:w-[60%] animate-fadeInLeft">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              
              {/* Contact Information */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-8 h-8 rounded-full bg-fm-text text-white flex items-center justify-center font-dm text-xs font-bold">1</span>
                  <h2 className="text-[20px] font-playfair font-bold text-fm-text uppercase tracking-wide">Contact Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      {...register('customerEmail')}
                      placeholder="e.g. customer@example.com"
                      className="w-full bg-[#FAFAF8] border border-fm-border px-5 py-4 font-dm text-sm focus:outline-none focus:border-fm-gold transition-all"
                    />
                    {errors.customerEmail && <p className="text-fm-error text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.customerEmail.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input
                      {...register('customerPhone')}
                      placeholder="e.g. 03001234567"
                      className="w-full bg-[#FAFAF8] border border-fm-border px-5 py-4 font-dm text-sm focus:outline-none focus:border-fm-gold transition-all"
                    />
                    {errors.customerPhone && <p className="text-fm-error text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.customerPhone.message}</p>}
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-8 h-8 rounded-full bg-fm-text text-white flex items-center justify-center font-dm text-xs font-bold">2</span>
                  <h2 className="text-[20px] font-playfair font-bold text-fm-text uppercase tracking-wide">Shipping Destination</h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">Recipient Name</label>
                    <input
                      {...register('customerName')}
                      placeholder="First and Last Name"
                      className="w-full bg-[#FAFAF8] border border-fm-border px-5 py-4 font-dm text-sm focus:outline-none focus:border-fm-gold transition-all"
                    />
                    {errors.customerName && <p className="text-fm-error text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">Street Address</label>
                    <input
                      {...register('shippingAddress.street')}
                      placeholder="House No, Street, Apartment, Area"
                      className="w-full bg-[#FAFAF8] border border-fm-border px-5 py-4 font-dm text-sm focus:outline-none focus:border-fm-gold transition-all"
                    />
                    {errors.shippingAddress?.street && <p className="text-fm-error text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.shippingAddress.street.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">City</label>
                      <input
                        {...register('shippingAddress.city')}
                        placeholder="e.g. Lahore"
                        className="w-full bg-[#FAFAF8] border border-fm-border px-5 py-4 font-dm text-sm focus:outline-none focus:border-fm-gold transition-all"
                      />
                      {errors.shippingAddress?.city && <p className="text-fm-error text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.shippingAddress.city.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">Province</label>
                      <input
                        {...register('shippingAddress.state')}
                        placeholder="e.g. Punjab"
                        className="w-full bg-[#FAFAF8] border border-fm-border px-5 py-4 font-dm text-sm focus:outline-none focus:border-fm-gold transition-all"
                      />
                      {errors.shippingAddress?.state && <p className="text-fm-error text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.shippingAddress.state.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">Zip / Postal Code</label>
                      <input
                        {...register('shippingAddress.zipCode')}
                        placeholder="e.g. 54000"
                        className="w-full bg-[#FAFAF8] border border-fm-border px-5 py-4 font-dm text-sm focus:outline-none focus:border-fm-gold transition-all"
                      />
                      {errors.shippingAddress?.zipCode && <p className="text-fm-error text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.shippingAddress.zipCode.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="font-dm text-[10px] font-bold text-fm-text-3 uppercase tracking-widest ml-1">Country</label>
                      <input
                        value="Pakistan"
                        disabled
                        className="w-full bg-[#F5F3EE] border border-fm-border px-5 py-4 font-dm text-sm text-fm-text-3 cursor-not-allowed uppercase font-bold tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-8 h-8 rounded-full bg-fm-text text-white flex items-center justify-center font-dm text-xs font-bold">3</span>
                  <h2 className="text-[20px] font-playfair font-bold text-fm-text uppercase tracking-wide">Secure Payment</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Secure payment at your doorstep' },
                    { id: 'jazzcash', label: 'JazzCash', desc: 'Seamless mobile wallet payment' },
                    { id: 'easypaisa', label: 'Easypaisa', desc: 'Instant authorization via app' },
                    { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct deposit instructions provided' }
                  ].map((method) => (
                    <label 
                      key={method.id}
                      className={`relative flex flex-col p-6 border transition-all duration-300 cursor-pointer group ${
                        paymentMethod === method.id ? 'border-fm-text bg-[#FAFAF8] shadow-sm' : 'border-fm-border hover:border-fm-border-dark'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-dm text-[13px] font-bold text-fm-text uppercase tracking-widest">{method.label}</span>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          checked={paymentMethod === method.id} 
                          onChange={() => setPaymentMethod(method.id as any)}
                          className="w-4 h-4 accent-fm-text"
                        />
                      </div>
                      <p className="font-dm text-[11px] text-fm-text-3">{method.desc}</p>
                    </label>
                  ))}
                </div>
              </section>

              {error && (
                <div className="p-5 bg-red-50 text-fm-error text-[12px] font-bold uppercase tracking-widest border border-red-100 flex items-center gap-3 animate-fadeIn">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{(error as any)?.data?.message || 'Error: Unable to place order. Please verify details.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A1714] text-white py-6 text-[13px] tracking-[0.3em] font-bold uppercase transition-all duration-500 hover:bg-fm-gold hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-4 btn-magnetic shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    PROCESSING ORDER...
                  </>
                ) : (
                  <>
                    PLACE ORDER &mdash; {formatPrice(total)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Order Summary */}
          <div className="w-full lg:w-[40%] bg-[#FAFAF8] p-6 md:p-10 border border-fm-border animate-fadeInRight">
            <h2 className="font-playfair text-[22px] font-bold text-fm-text uppercase tracking-tight mb-10 pb-4 border-b border-fm-border">Order Summary</h2>
            
            <div className="space-y-8 mb-10 max-h-[400px] overflow-y-auto pr-4 scroll-reveal">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color || 'nocolor'}`} className="flex gap-6 group">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 bg-white border border-fm-border p-2 flex items-center justify-center group-hover:border-fm-gold/50 transition-colors">
                       <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-[#1A1714] text-white font-dm text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-scaleIn">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-[12px] text-fm-text font-bold uppercase tracking-wide leading-snug group-hover:text-fm-gold transition-colors">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-1 opacity-70">
                      {item.color && <span className="font-dm text-[9px] font-bold uppercase tracking-widest">{item.color}</span>}
                    </div>
                    <div className="mt-2 font-dm text-[13px] font-bold text-fm-text">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-fm-border">
              <div className="flex justify-between items-center font-dm text-[11px] font-bold text-fm-text-3 tracking-[0.2em] uppercase">
                <span>SUBTOTAL</span>
                <span className="text-fm-text text-[14px] font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center font-dm text-[11px] font-bold text-fm-text-3 tracking-[0.2em] uppercase">
                <span>DELIVERY CHARGES (TCS)</span>
                <span className="text-fm-text text-[14px] font-bold">
                  {formatPrice(deliveryCharges)}
                </span>
              </div>
              
              <div className="h-px w-full bg-fm-border my-6"></div>
              
              <div className="flex justify-between items-baseline">
                <span className="font-playfair text-[18px] font-bold text-fm-text-3 uppercase tracking-tighter">TOTAL AMOUNT</span>
                <span className="font-playfair text-[32px] font-bold text-fm-text-2 tracking-tight">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white border border-fm-border flex items-center gap-4 animate-pulse">
              <span className="text-2xl">🛡️</span>
              <p className="font-dm text-[11px] text-fm-text-3 font-medium leading-relaxed uppercase tracking-widest">
                Safe & Secure Checkout • FM Mobile Accessories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

