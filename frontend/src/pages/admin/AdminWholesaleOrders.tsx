// frontend/src/pages/admin/AdminWholesaleOrders.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetWholesaleOrdersQuery } from '../../store/api/wholesaleApi';
import { WholesaleOrder } from '../../types';
import AddPaymentModal from './components/AddPaymentModal';

type PaymentFilter = '' | 'unpaid' | 'partial' | 'paid';

const AdminWholesaleOrders: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('');
  const [search, setSearch] = useState('');
  const [payingOrder, setPayingOrder] = useState<WholesaleOrder | null>(null);

  const { data, isLoading, isFetching } = useGetWholesaleOrdersQuery({
    page, limit: 20,
    paymentStatus: paymentFilter || undefined,
    search: search || undefined,
  });

  const orders = data?.data?.orders || [];
  const stats = data?.data?.stats || { totalValue: 0, totalCollected: 0, totalDue: 0, unpaidCount: 0, partialCount: 0 };
  const totalPages = data?.data?.pages || 1;

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return { cls: 'bg-emerald-900/40 text-emerald-400 border border-emerald-800', label: '✅ Paid' };
      case 'partial': return { cls: 'bg-amber-900/40 text-amber-400 border border-amber-800', label: '🟡 Partial' };
      default: return { cls: 'bg-red-900/40 text-red-400 border border-red-800', label: '🔴 Unpaid' };
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-emerald-400';
      case 'confirmed': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  return (
    <div className="animate-fadeIn font-dm relative">
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-white text-3xl font-bold">Wholesale Orders</h1>
            <p className="text-gray-400 tracking-widest text-[10px] uppercase font-bold mt-1">
              {data?.data?.total || 0} orders
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shop, city, phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-navy-mid border border-navy-light px-10 py-2.5 text-[13px] text-white placeholder-gray-500 outline-none focus:border-electric transition-all rounded-lg w-56"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button onClick={() => navigate('/admin/wholesale-orders/new')} className="bg-electric text-white px-5 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Order
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { key: '' as PaymentFilter, label: 'All Orders', count: data?.data?.total },
            { key: 'unpaid' as PaymentFilter, label: '🔴 Unpaid', count: stats.unpaidCount },
            { key: 'partial' as PaymentFilter, label: '🟡 Partial', count: stats.partialCount },
            { key: 'paid' as PaymentFilter, label: '✅ Paid', count: undefined },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setPaymentFilter(f.key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${paymentFilter === f.key ? 'bg-electric text-white' : 'bg-navy-mid border border-navy-light text-gray-400 hover:text-white'}`}
            >
              {f.label}
              {f.count !== undefined && <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${paymentFilter === f.key ? 'bg-white/20' : 'bg-navy-light'}`}>{f.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-12 pt-6">
        <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
          {/* Table */}
          {isLoading || isFetching ? (
            <div className="p-16 text-center text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-5xl mb-4 opacity-20">📦</div>
              <p className="text-white font-heading text-xl font-bold mb-2">No Wholesale Orders</p>
              <p className="text-gray-400 text-sm mb-6">Create your first wholesale order to get started.</p>
              <button onClick={() => navigate('/admin/wholesale-orders/new')} className="bg-electric text-white px-6 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                + New Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="border-b border-navy-light bg-navy-dark/50">
                  <tr>
                    {['Order ID', 'Shop Name', 'City', 'Total', 'Paid', 'Due', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-light">
                  {orders.map((order) => {
                    const sk = typeof order.shopKeeper === 'object' ? order.shopKeeper : null;
                    const shopName = order.shopName || sk?.shopName || '—';
                    const city = order.city || sk?.city || '—';
                    const badge = getPaymentStatusBadge(order.paymentStatus);
                    return (
                      <tr key={order._id} className="hover:bg-navy-light/20 transition-colors group">
                        <td className="px-4 py-4">
                          <button onClick={() => navigate(`/admin/wholesale-orders/${order._id}`)} className="text-electric font-bold text-[13px] hover:underline">
                            {order.orderId}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-white font-bold text-[13px]">{shopName}</td>
                        <td className="px-4 py-4 text-gray-400 text-[12px]">{city}</td>
                        <td className="px-4 py-4 text-white font-bold">PKR {order.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-emerald-400 font-bold">PKR {order.totalPaid.toLocaleString()}</td>
                        <td className={`px-4 py-4 font-bold ${order.totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {order.totalDue > 0 ? `PKR ${order.totalDue.toLocaleString()}` : '✅ —'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td className={`px-4 py-4 text-[12px] font-bold capitalize ${getOrderStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-[12px]">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/admin/wholesale-orders/${order._id}`)} className="px-3 py-1.5 bg-navy-dark border border-navy-light rounded-lg text-[11px] font-bold text-gray-300 hover:border-electric hover:text-electric transition-all">
                              View
                            </button>
                            {order.paymentStatus !== 'paid' && (
                              <button onClick={() => setPayingOrder(order)} className="px-3 py-1.5 bg-electric/20 text-electric border border-electric/40 rounded-lg text-[11px] font-bold hover:bg-electric hover:text-white transition-all">
                                + Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-navy-light flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 flex items-center justify-center border border-navy-light text-white hover:bg-navy-light disabled:opacity-20 rounded-lg transition-all">←</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 flex items-center justify-center border border-navy-light text-white hover:bg-navy-light disabled:opacity-20 rounded-lg transition-all">→</button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Bar */}
        <div className="mt-4 bg-navy-mid border border-navy-light rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Value', value: `PKR ${stats.totalValue.toLocaleString()}`, color: 'text-white' },
            { label: 'Collected', value: `PKR ${stats.totalCollected.toLocaleString()}`, color: 'text-emerald-400' },
            { label: 'Total Due', value: `PKR ${stats.totalDue.toLocaleString()}`, color: 'text-red-400' },
            { label: 'Unpaid / Partial', value: `${stats.unpaidCount} / ${stats.partialCount}`, color: 'text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
              <p className={`text-lg font-bold font-heading ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Payment Modal */}
      {payingOrder && (
        <AddPaymentModal
          order={payingOrder}
          onClose={() => setPayingOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminWholesaleOrders;
