// frontend/src/pages/admin/AdminWholesaleOrderDetail.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetWholesaleOrderByIdQuery, useUpdateWholesaleOrderStatusMutation, useDeleteWholesalePaymentMutation } from '../../store/api/wholesaleApi';
import { WholesalePayment } from '../../types';
import AddPaymentModal from './components/AddPaymentModal';
import toast from 'react-hot-toast';

const AdminWholesaleOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPayModal, setShowPayModal] = useState(false);

  const { data, isLoading, refetch } = useGetWholesaleOrderByIdQuery(id!);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateWholesaleOrderStatusMutation();
  const [deletePayment] = useDeleteWholesalePaymentMutation();

  const order = data?.data?.order;
  const payments = data?.data?.payments || [];
  const shopKeeper = order ? (typeof order.shopKeeper === 'object' ? order.shopKeeper : null) : null;

  const paidPct = order ? Math.min(100, Math.round((order.totalPaid / order.totalAmount) * 100)) : 0;

  const getPayBadgeCls = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-900/40 text-emerald-400 border border-emerald-800';
      case 'partial': return 'bg-amber-900/40 text-amber-400 border border-amber-800';
      default: return 'bg-red-900/40 text-red-400 border border-red-800';
    }
  };

  const handleStatusUpdate = async (field: string, value: string) => {
    try {
      await updateStatus({ id: id!, [field]: value }).unwrap();
      toast.success('Updated successfully');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Reverse this payment? This will reduce paid amount on the order.')) return;
    try {
      await deletePayment(paymentId).unwrap();
      toast.success('Payment reversed');
      refetch();
    } catch {
      toast.error('Failed to reverse');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-electric" /></div>;
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-400 text-lg">Order not found.</p>
        <button onClick={() => navigate('/admin/wholesale-orders')} className="mt-4 text-electric hover:underline">← Back</button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn font-dm pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/wholesale-orders')} className="text-gray-400 hover:text-electric transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-white text-2xl font-bold">{order.orderId}</h1>
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${getPayBadgeCls(order.paymentStatus)}`}>
                {order.paymentStatus === 'paid' ? '✅ Paid' : order.paymentStatus === 'partial' ? '🟡 Partial' : '🔴 Unpaid'}
              </span>
            </div>
            <p className="text-gray-400 text-[11px] uppercase tracking-widest">{shopKeeper?.shopName} | {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {order.paymentStatus !== 'paid' && (
            <button onClick={() => setShowPayModal(true)} className="bg-electric text-white px-5 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Payment
            </button>
          )}
        </div>
      </div>

      {/* Two-column Layout */}
      <div className="px-6 pt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-navy-mid border border-navy-light rounded-xl p-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-[12px] mb-4">Order Information</h3>
            <div className="space-y-3 text-[13px]">
              {[
                { label: 'Order ID', value: order.orderId },
                { label: 'Created', value: new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Payment Schedule', value: order.paymentSchedule.charAt(0).toUpperCase() + order.paymentSchedule.slice(1) },
                { label: 'Expected Full Payment', value: order.expectedPaymentDate ? new Date(order.expectedPaymentDate).toLocaleDateString('en-PK') : '—' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-2 border-b border-navy-light/50">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{r.label}</span>
                  <span className="text-white font-medium">{r.value}</span>
                </div>
              ))}
              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Order Status</label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusUpdate('orderStatus', e.target.value)}
                  disabled={isUpdating}
                  className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white rounded-lg outline-none focus:border-electric transition-all text-[13px]"
                >
                  {['pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s} className="bg-navy-dark">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Admin Notes</label>
                <textarea
                  defaultValue={order.adminNotes || ''}
                  onBlur={(e) => e.target.value !== (order.adminNotes || '') && handleStatusUpdate('adminNotes', e.target.value)}
                  placeholder="Private notes..."
                  rows={2}
                  className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white rounded-lg outline-none focus:border-electric transition-all text-[13px] resize-none placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* B2B Guest / Shop Keeper Details */}
          {(order.shopName || shopKeeper) && (
            <div className="bg-navy-mid border border-navy-light rounded-xl p-6">
              <h3 className="text-white font-bold uppercase tracking-widest text-[12px] mb-4">B2B Customer Details</h3>
              <div className="space-y-2 text-[13px]">
                {[
                  { label: 'Shop Name', value: order.shopName || shopKeeper?.shopName || '—' },
                  { label: 'Owner Name', value: order.ownerName || shopKeeper?.name || '—' },
                  { label: 'Phone', value: order.phone || shopKeeper?.phone || '—' },
                  { label: 'City', value: order.city || shopKeeper?.city || '—' },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between py-1.5 border-b border-navy-light/50">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{r.label}</span>
                    <span className="text-white">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy-light">
              <h3 className="text-white font-bold uppercase tracking-widest text-[12px]">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-navy-dark/50 border-b border-navy-light">
                  <tr>
                    {['Product', 'Brand', 'Qty', 'Unit Price', 'Subtotal'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-light">
                  {order.items.map((item, i) => (
                    <tr key={i} className="hover:bg-navy-light/10">
                      <td className="px-4 py-3 text-white font-bold text-[13px]">{item.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-[12px]">{item.brand || '—'}</td>
                      <td className="px-4 py-3 text-white font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-300 text-[13px]">PKR {item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-electric font-bold text-[13px]">PKR {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-navy-light space-y-2 text-[13px]">
              {[
                { label: 'Subtotal', value: order.subtotal, cls: 'text-gray-300' },
                { label: 'Delivery Fee', value: order.deliveryFee, cls: 'text-gray-300' },
                { label: 'Discount', value: -order.discount, cls: 'text-red-400' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-gray-400">{r.label}</span>
                  <span className={r.cls}>{r.label === 'Discount' ? `- PKR ${order.discount.toLocaleString()}` : `PKR ${r.value.toLocaleString()}`}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-navy-light font-bold">
                <span className="text-white uppercase tracking-wider">Total Amount</span>
                <span className="text-electric text-lg">PKR {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-navy-mid border border-navy-light rounded-xl p-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-[12px] mb-5">Payment Summary</h3>
            <div className="space-y-3 text-[14px] mb-5">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Total</span>
                <span className="text-white font-bold">PKR {order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Paid</span>
                <span className="text-emerald-400 font-bold">PKR {order.totalPaid.toLocaleString()} ({paidPct}%)</span>
              </div>
              <div className="flex justify-between border-t border-navy-light pt-3">
                <span className="text-white font-bold uppercase tracking-widest text-[12px]">Amount Due</span>
                <span className={`font-bold text-lg ${order.totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {order.totalDue > 0 ? `PKR ${order.totalDue.toLocaleString()}` : '✅ Fully Paid'}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-3 bg-navy-dark rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${paidPct >= 100 ? 'bg-emerald-500' : 'bg-electric'}`}
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-bold text-white">{paidPct}% paid</span>
              <span>100%</span>
            </div>

            {order.paymentStatus !== 'paid' && (
              <button onClick={() => setShowPayModal(true)} className="mt-5 w-full bg-electric text-white py-3 rounded-xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Payment
              </button>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy-light">
              <h3 className="text-white font-bold uppercase tracking-widest text-[12px]">Payment History</h3>
            </div>
            {payments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-4xl mb-3 opacity-30">💳</p>
                <p className="text-[13px] font-bold">No payments recorded yet</p>
                <p className="text-[11px] mt-1">Click "+ Add Payment" to record the first payment</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap text-[12px]">
                    <thead className="bg-navy-dark/50 border-b border-navy-light">
                      <tr>
                        {['#', 'Date', 'Amount', 'Method', 'Note', 'Due After', ''].map((h) => (
                          <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-light">
                      {(payments as WholesalePayment[]).map((p, i) => (
                        <tr key={p._id} className="hover:bg-navy-light/10">
                          <td className="px-4 py-3 text-gray-500 font-bold">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-400">
                            {new Date(p.paymentDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-emerald-400 font-bold text-[13px]">PKR {p.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-white capitalize">{p.method.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-gray-400">{p.installmentNote || '—'}</td>
                          <td className={`px-4 py-3 font-bold ${p.dueAfterThis > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            PKR {p.dueAfterThis.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDeletePayment(p._id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Reverse payment">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-navy-light flex justify-between items-center">
                  <span className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">Total Received</span>
                  <span className="text-emerald-400 font-bold text-[15px]">PKR {order.totalPaid.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <AddPaymentModal order={order} onClose={() => setShowPayModal(false)} />
      )}
    </div>
  );
};

export default AdminWholesaleOrderDetail;
