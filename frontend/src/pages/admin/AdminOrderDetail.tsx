import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useDeletePaymentMutation,
  useUpdateAdminNoteMutation,
} from '../../store/api/ordersApi';
import AddOrderPaymentModal from './components/AddOrderPaymentModal';
import toast from 'react-hot-toast';

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPayModal, setShowPayModal] = useState(false);

  const { data, isLoading, refetch } = useGetOrderByIdQuery(id!);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [deletePayment] = useDeletePaymentMutation();
  const [updateNote] = useUpdateAdminNoteMutation();

  const order = data?.data;
  const payments = (order as any)?.payments || [];

  const totalAmount = order?.totalAmount || 0;
  const totalPaid = order?.totalPaid || 0;
  const totalDue = order?.totalDue ?? Math.max(0, totalAmount - totalPaid);
  const paidPct = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  const getPayBadgeCls = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-950/40 text-emerald-400 border border-emerald-800';
      case 'partial':
        return 'bg-amber-950/40 text-amber-400 border border-amber-800';
      case 'unpaid':
      default:
        return 'bg-red-950/40 text-red-400 border border-red-800';
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus({ id: id!, orderStatus: newStatus }).unwrap();
      toast.success('Order status updated successfully');
      refetch();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const handleNoteUpdate = async (newNote: string) => {
    try {
      await updateNote({ id: id!, adminNote: newNote }).unwrap();
      toast.success('Internal note updated');
      refetch();
    } catch {
      toast.error('Failed to update internal note');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to reverse this payment? This will reduce the amount paid and increase the outstanding balance.')) return;
    try {
      await deletePayment(paymentId).unwrap();
      toast.success('Payment reversed successfully');
      refetch();
    } catch {
      toast.error('Failed to reverse payment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-electric border-t-transparent"></div>
        <p className="text-[11px] uppercase tracking-widest font-black">Syncing order detail...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center font-dm text-white">
        <p className="text-gray-400 text-lg">Order not found.</p>
        <button onClick={() => navigate('/admin/orders')} className="mt-4 text-electric hover:underline font-bold text-[13px] uppercase tracking-widest">
          &larr; Back to Orders
        </button>
      </div>
    );
  }

  const shopName = order.shopName || order.customerAddress || '—';
  const ownerName = order.ownerName || order.customerName || '—';
  const phone = order.phone || order.customerPhone || '—';
  const city = order.city || order.customerCity || '—';

  return (
    <div className="animate-fadeIn font-dm pb-12 text-white">
      {/* 1. FIXED HEADER STRIP */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/orders')} className="p-2 text-gray-400 hover:text-white hover:bg-navy-light rounded-lg transition-all cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-white text-2xl font-bold">{order.orderId || order.orderNumber}</h1>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getPayBadgeCls(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-1">
                {shopName} • {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {order.paymentStatus !== 'paid' && (
            <button
              onClick={() => setShowPayModal(true)}
              className="bg-electric text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              + Record Payment
            </button>
          )}
        </div>
      </div>

      {/* 2. DUAL COLUMN LAYOUT */}
      <div className="px-6 pt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: CONTEXT, ITEMS */}
        <div className="space-y-6">
          
          {/* Order Info */}
          <div className="bg-navy-mid border border-navy-light rounded-xl p-6 shadow-xs">
            <h3 className="text-white font-bold uppercase tracking-widest text-[11px] mb-4">Order Specifications</h3>
            <div className="space-y-3 text-[13px]">
              {[
                { label: 'Order ID', value: order.orderId || order.orderNumber },
                { label: 'Created At', value: new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                { label: 'Payment Terms', value: order.paymentSchedule ? order.paymentSchedule.toUpperCase() : 'COD' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-2 border-b border-navy-light/40">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">{r.label}</span>
                  <span className="text-white font-medium">{r.value}</span>
                </div>
              ))}
              
              <div className="pt-2">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Fulfillment Status</label>
                <select
                  value={order.orderStatus}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white rounded-lg outline-none focus:border-electric transition-all text-[13px] font-bold cursor-pointer"
                >
                  {['pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s} className="bg-navy-dark uppercase font-bold text-gray-300">
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Internal Private Note</label>
                <textarea
                  defaultValue={order.adminNote || ''}
                  onBlur={(e) => e.target.value !== (order.adminNote || '') && handleNoteUpdate(e.target.value)}
                  placeholder="Type notes only visible to administrators here..."
                  rows={2}
                  className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white rounded-lg outline-none focus:border-electric transition-all text-[13px] resize-none placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Shopkeeper Details */}
          <div className="bg-navy-mid border border-navy-light rounded-xl p-6 shadow-xs">
            <h3 className="text-white font-bold uppercase tracking-widest text-[11px] mb-4">Shopkeeper Details</h3>
            <div className="space-y-3 text-[13px]">
              {[
                { label: 'Shop / Address', value: shopName },
                { label: 'Contact Owner', value: ownerName },
                { label: 'Mobile Phone', value: phone },
                { label: 'Target City', value: city },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-2 border-b border-navy-light/40">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">{r.label}</span>
                  <span className="text-white font-medium">{r.value}</span>
                </div>
              ))}
              {order.note && (
                <div className="pt-2">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Customer Checkout Note:</span>
                  <p className="text-gray-300 text-[12px] bg-navy-dark border border-navy-light/50 rounded-lg p-3 mt-1.5 italic">
                    "{order.note}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-navy-light">
              <h3 className="text-white font-bold uppercase tracking-widest text-[11px]">Fulfillment Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-[13px]">
                <thead className="bg-navy-dark/40 border-b border-navy-light text-gray-400 font-bold uppercase text-[9px] tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-light/60">
                  {order.items.map((item, i) => (
                    <tr key={i} className="hover:bg-navy-light/10">
                      <td className="px-4 py-3 text-white font-bold max-w-[240px] truncate">
                        {item.name}
                        {(item.size || item.color) && (
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {item.size ? `Size: ${item.size}` : ''} {item.color ? `Color: ${item.color}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-white font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-300">PKR {item.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-electric font-bold">PKR {(item.subtotal || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries */}
            <div className="px-6 py-4 border-t border-navy-light space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Items Subtotal</span>
                <span className="text-gray-300">PKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TCS Delivery Fee</span>
                <span className="text-gray-300">PKR {(order.deliveryFee || 0).toLocaleString()}</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-400">Discount Applied</span>
                  <span className="text-red-400">- PKR {(order.discount || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-navy-light font-bold">
                <span className="text-white uppercase tracking-wider text-[11px]">Final Order Total</span>
                <span className="text-electric text-lg">PKR {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PAYMENT SUMMARY, PROGRESS, LEDGER */}
        <div className="space-y-6">
          
          {/* Payment Summary */}
          <div className="bg-navy-mid border border-navy-light rounded-xl p-6 shadow-xs">
            <h3 className="text-white font-bold uppercase tracking-widest text-[11px] mb-5">Accounts Standing</h3>
            <div className="space-y-3.5 text-[14px] mb-5">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount Booked</span>
                <span className="text-white font-bold">PKR {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Installments Collected</span>
                <span className="text-emerald-400 font-bold">
                  PKR {totalPaid.toLocaleString()} ({paidPct}%)
                </span>
              </div>
              <div className="flex justify-between border-t border-navy-light pt-3.5">
                <span className="text-white font-bold uppercase tracking-widest text-[11px]">Remaining Due Balance</span>
                <span className={`font-bold text-lg ${totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {totalDue > 0 ? `PKR ${totalDue.toLocaleString()}` : '✅ FULLY CLEARED'}
                </span>
              </div>
            </div>

            {/* Micro progress bar */}
            <div className="h-3 bg-navy-dark rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${paidPct >= 100 ? 'bg-emerald-500' : 'bg-electric'}`}
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1.5 font-bold">
              <span>0%</span>
              <span className="text-white">{paidPct}% paid</span>
              <span>100%</span>
            </div>

            {order.paymentStatus !== 'paid' && (
              <button
                onClick={() => setShowPayModal(true)}
                className="mt-6 w-full bg-electric text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Record Payment
              </button>
            )}
          </div>

          {/* Payment History Ledger */}
          <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-navy-light">
              <h3 className="text-white font-bold uppercase tracking-widest text-[11px]">Installment Log Ledger</h3>
            </div>
            
            {payments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-4xl mb-3 opacity-30">💳</p>
                <p className="text-[13px] font-bold">No payments recorded yet</p>
                <p className="text-[11px] mt-1">Record installment payments above to balance the outstanding ledger.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap text-[12px]">
                    <thead className="bg-navy-dark/40 border-b border-navy-light text-gray-400 font-bold uppercase text-[9px] tracking-widest">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3">Channel</th>
                        <th className="px-4 py-3">TxID / Note</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-light/60">
                      {payments.map((p: any, i: number) => (
                        <tr key={p._id} className="hover:bg-navy-light/10">
                          <td className="px-4 py-3 text-gray-500 font-bold">{i + 1}</td>
                          <td className="px-4 py-3 text-gray-400 font-medium">
                            {new Date(p.paymentDate || p.createdAt).toLocaleDateString('en-PK', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-bold text-[13px]">
                            +PKR {p.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 capitalize text-white">
                            {p.method?.toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-gray-400 max-w-[150px] truncate">
                            {p.transactionId && <span className="block text-white font-mono text-[10px]">{p.transactionId}</span>}
                            {p.installmentNote || '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeletePayment(p._id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                              title="Delete (Reverse) Payment"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-navy-light flex justify-between items-center bg-navy-dark/20">
                  <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Total Collected</span>
                  <span className="text-emerald-400 font-bold text-[16px]">PKR {totalPaid.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      {/* 3. ADD PAYMENT MODAL TRACING */}
      {showPayModal && (
        <AddOrderPaymentModal
          order={order}
          onClose={() => {
            setShowPayModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default AdminOrderDetail;
