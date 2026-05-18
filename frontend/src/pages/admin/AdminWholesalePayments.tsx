// frontend/src/pages/admin/AdminWholesalePayments.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetWholesalePaymentsQuery, useDeleteWholesalePaymentMutation } from '../../store/api/wholesaleApi';
import { WholesalePayment } from '../../types';
import toast from 'react-hot-toast';

const AdminWholesalePayments: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useGetWholesalePaymentsQuery({ page, limit: 30, from: from || undefined, to: to || undefined });
  const [deletePayment] = useDeleteWholesalePaymentMutation();

  const payments = (data?.data?.payments || []) as WholesalePayment[];
  const totalPages = data?.data?.pages || 1;

  const handleDelete = async (id: string) => {
    if (!confirm('Reverse this payment? This will reduce paid amounts on the associated order.')) return;
    try {
      await deletePayment(id).unwrap();
      toast.success('Payment reversed');
    } catch {
      toast.error('Failed to reverse payment');
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-fadeIn font-dm">
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-white text-3xl font-bold">Payment History</h1>
            <p className="text-gray-400 tracking-widest text-[10px] uppercase font-bold mt-1">All wholesale payment records</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="bg-navy-mid border border-navy-light px-3 py-2.5 text-white text-[12px] rounded-lg outline-none focus:border-electric transition-all" />
            <span className="text-gray-500">to</span>
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="bg-navy-mid border border-navy-light px-3 py-2.5 text-white text-[12px] rounded-lg outline-none focus:border-electric transition-all" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 pt-6">
        <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center text-gray-400">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-5xl mb-4 opacity-20">💰</div>
              <p className="text-white font-heading text-xl font-bold mb-2">No Payments Yet</p>
              <p className="text-gray-400 text-sm">Payments will appear here once recorded on wholesale orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="border-b border-navy-light bg-navy-dark/50">
                  <tr>
                    {['#', 'Date', 'Shop', 'Order', 'Amount', 'Method', 'Installment', 'Tx ID', 'Due After', 'Action'].map((h) => (
                      <th key={h} className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-light">
                  {payments.map((p, i) => {
                    const sk = typeof p.shopKeeper === 'object' ? p.shopKeeper : null;
                    const order = typeof p.order === 'object' ? p.order : null;
                    return (
                      <tr key={p._id} className="hover:bg-navy-light/20 transition-colors">
                        <td className="px-4 py-4 text-gray-500 font-bold text-[12px]">{(page - 1) * 30 + i + 1}</td>
                        <td className="px-4 py-4 text-gray-400 text-[12px]">{new Date(p.paymentDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-4 py-4">
                          {sk ? (
                            <button onClick={() => navigate(`/admin/shopkeepers/${sk._id}`)} className="text-white font-bold text-[13px] hover:text-electric transition-colors">{sk.shopName}</button>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-4">
                          {order ? (
                            <button onClick={() => navigate(`/admin/wholesale-orders/${typeof p.order === 'object' ? (p.order as { _id: string })._id : p.order}`)} className="text-electric text-[12px] font-bold hover:underline">
                              {(order as { orderId?: string }).orderId || 'View'}
                            </button>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-4 text-emerald-400 font-bold text-[14px]">PKR {p.amount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-white text-[12px] capitalize">{p.method.replace('_', ' ')}</td>
                        <td className="px-4 py-4 text-gray-400 text-[12px]">{p.installmentNote || '—'}</td>
                        <td className="px-4 py-4 text-gray-500 text-[11px] font-mono">{p.transactionId || '—'}</td>
                        <td className={`px-4 py-4 font-bold text-[13px] ${p.dueAfterThis > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          PKR {p.dueAfterThis.toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => handleDelete(p._id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Reverse payment">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {payments.length > 0 && (
            <div className="px-6 py-4 border-t border-navy-light flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Page {page} of {totalPages}</span>
                <span className="text-[12px] text-emerald-400 font-bold">Period Total: PKR {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 flex items-center justify-center border border-navy-light text-white hover:bg-navy-light disabled:opacity-20 rounded-lg transition-all">←</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 flex items-center justify-center border border-navy-light text-white hover:bg-navy-light disabled:opacity-20 rounded-lg transition-all">→</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWholesalePayments;
