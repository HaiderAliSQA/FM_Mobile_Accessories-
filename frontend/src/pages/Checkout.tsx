import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';
import { usePlaceOrderMutation } from '../store/api/ordersApi';
import { formatPrice } from '../utils/formatPrice';

const pkPhoneRegex = /^03\d{9}$/;

const checkoutSchema = z.object({
  shopName: z.string().min(2, 'Shop Name is required (minimum 2 characters)'),
  ownerName: z.string().min(2, 'Owner/Contact Name is required (minimum 2 characters)'),
  phone: z.string().regex(pkPhoneRegex, 'Number must start with 03 and be exactly 11 digits (e.g., 03001234567)'),
  city: z.string().min(2, 'City is required'),
  paymentSchedule: z.enum(['weekly', 'monthly', 'immediate']),
  note: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryCharges, total, clearCart } = useCart();
  const [placeOrder, { isLoading, error, isSuccess }] = usePlaceOrderMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentSchedule: 'weekly',
      note: '',
    },
  });

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const isSingleItem = totalQuantity === 1;

  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      navigate('/');
    }
  }, [items, navigate, isSuccess]);

  useEffect(() => {
    if (isSingleItem) {
      setValue('paymentSchedule', 'immediate');
    } else {
      setValue('paymentSchedule', 'weekly');
    }
  }, [isSingleItem, setValue]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const orderPayload = {
        shopName: data.shopName.trim(),
        ownerName: data.ownerName.trim(),
        phone: data.phone.trim(),
        city: data.city.trim(),
        paymentSchedule: data.paymentSchedule,
        note: data.note?.trim() || '',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          color: item.color,
          size: item.size,
        })),
      };

      const result = await placeOrder(orderPayload).unwrap();

      if (result.success && result.data?.order) {
        clearCart(); // Clean cart state upon successful placement
        navigate(`/order-confirmation/${result.data.order.orderId}`);
      }
    } catch (err: any) {
      console.error('Failed to place B2B wholesale order:', err);
      const msg = err?.data?.message || err?.message || 'Failed to place B2B wholesale order';
      toast.error(`⚠️ ${msg}`);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-navy-dark pt-24 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Progress Stepper */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <h1 className="font-heading text-white text-3xl md:text-5xl font-extrabold uppercase tracking-tighter italic mb-4">
            Wholesale <span className="text-electric">Checkout</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.25em] text-center max-w-md">
            Guest Checkout • No password required
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left Panel: B2B Checkout Form */}
          <div className="w-full lg:w-[60%] space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* Section 1: Shop & Contact Info */}
              <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center font-heading text-lg font-extrabold border border-electric/20 shadow-glow-blue/10">1</span>
                  <h2 className="text-lg font-heading font-extrabold text-white uppercase tracking-tight">Shop & Contact Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Shop Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Shop Name</label>
                    <input
                      {...register('shopName')}
                      placeholder="e.g. Al-Rehman Mobile Store"
                      maxLength={80}
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.shopName && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.shopName.message}</p>}
                  </div>

                  {/* Owner Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Owner / Contact Name</label>
                    <input
                      {...register('ownerName', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        }
                      })}
                      placeholder="e.g. Hafiz Huraira"
                      maxLength={50}
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.ownerName && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.ownerName.message}</p>}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number (Pakistani)</label>
                    <input
                      {...register('phone', {
                        onChange: (e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 0 && val[0] !== '0') {
                            val = '';
                          }
                          e.target.value = val;
                        }
                      })}
                      placeholder="e.g. 03001234567"
                      maxLength={11}
                      inputMode="numeric"
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.phone && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.phone.message}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City / Region</label>
                    <input
                      {...register('city', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        }
                      })}
                      placeholder="e.g. Chiniot"
                      maxLength={50}
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700"
                    />
                    {errors.city && <p className="text-red-400 text-[10px] mt-1 font-bold uppercase tracking-wider">{errors.city.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Ledger Payment Schedule & Notes */}
              <div className="bg-navy-mid border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-5">
                  <span className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center font-heading text-lg font-extrabold border border-electric/20 shadow-glow-blue/10">2</span>
                  <h2 className="text-lg font-heading font-extrabold text-white uppercase tracking-tight">Ledger / بہی کھاتہ Schedule</h2>
                </div>

                <div className="space-y-6">
                  {/* Payment Schedule Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Schedule</label>
                    <div className={`grid gap-4 ${isSingleItem ? 'grid-cols-1 max-w-xs' : 'grid-cols-3'}`}>
                      {[
                        { id: 'weekly', title: 'Weekly', desc: 'Pay every week' },
                        { id: 'monthly', title: 'Monthly', desc: 'Pay every month' },
                        { id: 'immediate', title: 'COD', desc: 'Pay on delivery' }
                      ].filter(item => !isSingleItem || item.id === 'immediate').map((item) => (
                        <label
                          key={item.id}
                          className="relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer border-white/5 bg-navy-dark hover:border-white/20 has-[:checked]:border-electric has-[:checked]:bg-electric/5"
                        >
                          <input
                            type="radio"
                            value={item.id}
                            {...register('paymentSchedule')}
                            className="absolute top-4 right-4 accent-electric"
                          />
                          <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">{item.title}</span>
                          <span className="text-[9px] text-gray-600 font-medium uppercase">{item.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Special Instructions / Order Notes (Optional)</label>
                    <textarea
                      {...register('note')}
                      rows={3}
                      placeholder="e.g. Please pack safely, or request specific colors/items..."
                      className="w-full bg-navy-dark border border-white/5 px-6 py-4 rounded-2xl text-white font-body text-sm focus:outline-none focus:border-electric transition-all placeholder:text-gray-700 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error Summary Banner */}
              {error && (
                <div className="p-6 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest rounded-2xl border border-red-500/20 flex items-center gap-4">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{(error as any)?.data?.message || 'Failed to place B2B wholesale order. Please verify details.'}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-electric text-white py-6 rounded-[2rem] text-sm font-extrabold uppercase tracking-[0.35em] transition-all hover:shadow-glow-blue active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-4 animate-pulse-glow"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Submit Order • {formatPrice(total)}</>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Order Summary */}
          <div className="w-full lg:w-[40%] bg-navy-mid/50 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 space-y-8 sticky top-32">
            <h2 className="font-heading text-lg font-extrabold text-white uppercase tracking-tight italic border-b border-white/5 pb-4">
              Order Items
            </h2>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color || 'nocolor'}-${item.size || 'nosize'}`} className="flex gap-4 group">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 bg-navy-dark rounded-xl border border-white/5 p-1.5 flex items-center justify-center group-hover:border-electric/40 transition-colors">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-electric text-white font-heading text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-navy-mid">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h3 className="text-[11px] text-white font-bold uppercase tracking-wide leading-tight group-hover:text-electric transition-colors">{item.name}</h3>
                    {item.color && <p className="text-[8px] font-extrabold text-gray-500 uppercase tracking-widest">{item.color}</p>}
                    <p className="text-xs font-bold text-electric mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                <span>Cart Subtotal</span>
                <span className="text-white text-xs font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                <span>Shipping Fee</span>
                <span className={deliveryCharges === 0 ? "text-emerald-400 text-xs font-extrabold uppercase" : "text-white text-xs font-bold"}>
                  {deliveryCharges === 0 ? 'FREE' : formatPrice(deliveryCharges)}
                </span>
              </div>

              <div className="pt-6 flex justify-between items-end border-t border-white/5">
                <span className="font-heading text-white text-base font-extrabold uppercase italic tracking-tighter">Estimated Total</span>
                <div className="text-right">
                  <span className="text-electric font-extrabold text-3xl block leading-none tracking-tighter italic">{formatPrice(total)}</span>
                  <span className="text-gray-700 text-[9px] font-extrabold uppercase tracking-[0.2em] block mt-2 text-right">No Hidden Costs</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-navy-dark rounded-2xl border border-white/5 flex flex-col items-center gap-3 text-center">
              <div className="flex gap-3 text-lg">
                <span>🛡️</span>
                <span>🚚</span>
                <span>🤝</span>
              </div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                FH Wholesale Network Pakistan • Delivery via TCS Courier Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
