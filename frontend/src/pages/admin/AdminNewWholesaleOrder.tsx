// frontend/src/pages/admin/AdminNewWholesaleOrder.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetShopKeepersQuery, useCreateWholesaleOrderMutation } from '../../store/api/wholesaleApi';
import { ShopKeeper } from '../../types';
import toast from 'react-hot-toast';

interface OrderItem {
  name: string;
  brand: string;
  price: string;
  quantity: string;
}

const AdminNewWholesaleOrder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledSkId = searchParams.get('shopkeeper') || '';

  const [createOrder, { isLoading }] = useCreateWholesaleOrderMutation();

  const [skSearch, setSkSearch] = useState('');
  const [selectedSK, setSelectedSK] = useState<ShopKeeper | null>(null);
  const [showSKDropdown, setShowSKDropdown] = useState(false);

  const [items, setItems] = useState<OrderItem[]>([{ name: '', brand: '', price: '', quantity: '1' }]);
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [paymentSchedule, setPaymentSchedule] = useState('weekly');
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: skData } = useGetShopKeepersQuery({ search: skSearch || undefined, limit: 8 }, { skip: skSearch.length < 1 });
  const shopKeepers = skData?.data?.shopKeepers || [];

  // Pre-fill from query param
  const { data: allSKData } = useGetShopKeepersQuery({ limit: 100 }, { skip: !prefilledSkId });
  useEffect(() => {
    if (prefilledSkId && allSKData) {
      const found = allSKData.data.shopKeepers.find(s => s._id === prefilledSkId);
      if (found) setSelectedSK(found);
    }
  }, [prefilledSkId, allSKData]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity) || 0), 0);
  const totalAmount = subtotal + Number(deliveryFee) - Number(discount);

  const creditLimitExceeded = selectedSK && totalAmount + selectedSK.totalDue > selectedSK.creditLimit;

  const addItem = () => setItems(prev => [...prev, { name: '', brand: '', price: '', quantity: '1' }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, value: string) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSK) {
      toast.error('⚠️ Please search and select a Shop Keeper first!');
      const el = document.getElementById('step-1');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (items.some(i => !i.name.trim() || !i.price || Number(i.price) <= 0 || Number(i.quantity) < 1)) {
      toast.error('⚠️ Please ensure all items have a name, valid price, and quantity greater than 0');
      return;
    }
    if (totalAmount <= 0) {
      toast.error('⚠️ Total order amount must be greater than PKR 0');
      return;
    }

    try {
      const result = await createOrder({
        shopKeeperId: selectedSK._id,
        items: items.map(i => ({ name: i.name.trim(), brand: i.brand.trim() || undefined, price: Number(i.price), quantity: Number(i.quantity) })),
        deliveryFee: Number(deliveryFee),
        discount: Number(discount),
        paymentSchedule,
        expectedPaymentDate: expectedPaymentDate || undefined,
        adminNotes: adminNotes.trim() || undefined,
      }).unwrap();

      if (result.creditLimitWarning) toast(result.creditLimitWarning, { icon: '⚠️' });
      toast.success('Wholesale order created!');
      navigate(`/admin/wholesale-orders/${(result.data as { _id: string })._id}`);
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to create order');
    }
  };

  return (
    <div className="animate-fadeIn font-dm pb-12">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/wholesale-orders')} className="text-gray-400 hover:text-electric transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="font-heading text-white text-2xl font-bold">New Wholesale Order</h1>
            <p className="text-gray-400 text-[11px] uppercase tracking-widest">Create a new bulk order for a shop keeper</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pt-6 max-w-4xl space-y-6">
        {/* STEP 1: Shop Keeper */}
        <div id="step-1" className="bg-navy-mid border border-navy-light rounded-xl p-6">
          <h3 className="text-white font-bold uppercase tracking-widest text-[12px] mb-4">
            <span className="bg-electric text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-[11px] mr-2">1</span>
            Select Shop Keeper
          </h3>
          <div className="relative">
            <input
              placeholder="Type to search shop name, phone..."
              value={selectedSK ? `${selectedSK.shopName} — ${selectedSK.name}` : skSearch}
              onChange={(e) => { setSkSearch(e.target.value); setSelectedSK(null); setShowSKDropdown(true); }}
              onFocus={() => setShowSKDropdown(true)}
              className="w-full bg-navy-dark border border-navy-light px-4 py-3 text-white text-[13px] rounded-xl outline-none focus:border-electric transition-all placeholder-gray-600"
            />
            {showSKDropdown && shopKeepers.length > 0 && !selectedSK && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-navy-mid border border-navy-light rounded-xl overflow-hidden shadow-2xl">
                {shopKeepers.map((sk) => (
                  <button
                    key={sk._id}
                    type="button"
                    onClick={() => { setSelectedSK(sk); setShowSKDropdown(false); setSkSearch(''); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-navy-light transition-colors text-left border-b border-navy-light last:border-0"
                  >
                    <div>
                      <p className="text-white font-bold text-[13px]">{sk.shopName}</p>
                      <p className="text-gray-400 text-[11px]">{sk.name} | {sk.city} | {sk.phone}</p>
                    </div>
                    {sk.totalDue > 0 && (
                      <span className="text-red-400 text-[11px] font-bold">Due: PKR {sk.totalDue.toLocaleString()}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSK && (
            <div className={`mt-3 p-4 rounded-xl border ${creditLimitExceeded ? 'bg-amber-900/20 border-amber-700' : 'bg-navy-dark border-navy-light'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-bold">{selectedSK.shopName}</p>
                  <p className="text-gray-400 text-[12px]">{selectedSK.name} | {selectedSK.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Current Due</p>
                  <p className={`font-bold text-[14px] ${selectedSK.totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    PKR {selectedSK.totalDue.toLocaleString()}
                  </p>
                </div>
              </div>
              {creditLimitExceeded && (
                <p className="text-amber-400 text-[12px] font-bold mt-2">
                  ⚠️ This order will exceed credit limit by PKR {(totalAmount + selectedSK.totalDue - selectedSK.creditLimit).toLocaleString()}
                </p>
              )}
              <button type="button" onClick={() => setSelectedSK(null)} className="mt-2 text-gray-500 text-[11px] hover:text-red-400 transition-colors">
                × Change
              </button>
            </div>
          )}
        </div>

        {/* STEP 2: Add Products */}
        <div className="bg-navy-mid border border-navy-light rounded-xl p-6">
          <h3 className="text-white font-bold uppercase tracking-widest text-[12px] mb-4">
            <span className="bg-electric text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-[11px] mr-2">2</span>
            Add Products
          </h3>

          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4">
                  {i === 0 && <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Product Name *</label>}
                  <input type="text" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} placeholder="Samsung A15 Cover" required className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all placeholder-gray-600" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Brand</label>}
                  <input type="text" value={item.brand} onChange={(e) => updateItem(i, 'brand', e.target.value)} placeholder="Baseus" className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all placeholder-gray-600" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Unit Price (PKR) *</label>}
                  <input type="number" min="1" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} placeholder="250" required className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all placeholder-gray-600" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Qty *</label>}
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} required className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all" />
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Subtotal</label>}
                  <p className="text-electric font-bold text-[13px] py-2.5">PKR {(Number(item.price) * Number(item.quantity) || 0).toLocaleString()}</p>
                </div>
                <div className="col-span-1 flex items-end pb-1">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addItem} className="mt-4 flex items-center gap-2 text-electric text-[12px] font-bold hover:text-blue-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Item
          </button>
        </div>

        {/* STEP 3: Order Summary */}
        <div className="bg-navy-mid border border-navy-light rounded-xl p-6">
          <h3 className="text-white font-bold uppercase tracking-widest text-[12px] mb-4">
            <span className="bg-electric text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-[11px] mr-2">3</span>
            Order Summary & Schedule
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Delivery Fee (PKR)</label>
              <input type="number" min="0" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Discount (PKR)</label>
              <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all" />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-navy-dark rounded-xl p-4 space-y-2 text-[13px] mb-6">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-400"><span>Delivery Fee</span><span>PKR {Number(deliveryFee).toLocaleString()}</span></div>
            <div className="flex justify-between text-red-400"><span>Discount</span><span>- PKR {Number(discount).toLocaleString()}</span></div>
            <div className="flex justify-between text-white font-bold text-[16px] border-t border-navy-light pt-2">
              <span>Total Amount</span>
              <span className="text-electric">PKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Schedule</label>
            <div className="flex gap-2 flex-wrap">
              {['weekly', 'monthly', 'custom', 'immediate'].map((s) => (
                <button key={s} type="button" onClick={() => setPaymentSchedule(s)}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all border ${paymentSchedule === s ? 'bg-electric border-electric text-white' : 'bg-navy-dark border-navy-light text-gray-400 hover:border-gray-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Expected Full Payment By</label>
              <input type="date" value={expectedPaymentDate} onChange={(e) => setExpectedPaymentDate(e.target.value)} className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Notes (optional)</label>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Notes about this order..." rows={2} className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all resize-none placeholder-gray-600" />
          </div>
        </div>


        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/admin/wholesale-orders')} className="flex-1 border border-navy-light text-gray-300 hover:text-white py-4 rounded-xl font-bold text-[13px] uppercase tracking-widest transition-all">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 bg-electric text-white py-4 rounded-xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : `✓ Create Order — PKR ${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </form>
    </div>
  );
};


export default AdminNewWholesaleOrder;
