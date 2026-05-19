// frontend/src/pages/admin/AdminOrders.tsx
import React, { useState } from 'react';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../../store/api/ordersApi';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const AdminOrders: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data, isLoading } = useGetOrdersQuery({ page, limit, search, orderStatus: statusFilter });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = data?.data?.orders || [];
  const totalPages = data?.data?.pages || 1;

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, orderStatus: newStatus }).unwrap();
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
      case 'pending':
      case 'processing':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/60';
      case 'confirmed':
      case 'shipped':
        return 'bg-sky-950/40 text-sky-400 border-sky-800/60';
      case 'failed':
      case 'cancelled':
      case 'returned':
        return 'bg-red-950/40 text-red-400 border-red-800/60';
      default:
        return 'bg-navy-dark text-gray-400 border-navy-light';
    }
  };

  return (
    <div className="animate-fadeIn font-dm relative">
      {/* 1. FIXED PAGE HEADER & TOOLBAR */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-playfair text-white text-[32px] font-bold tracking-tight">Customer Orders</h1>
            <p className="text-gray-400 tracking-[0.2em] text-[10px] uppercase font-bold">Fulfillment Center • {data?.data?.total || 0} transactions</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl justify-end">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by Order #, Name or Email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-navy-mid border border-navy-light px-10 py-3 text-[13px] font-dm text-white placeholder-gray-500 outline-none focus:border-gold transition-all shadow-sm"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className={`w-full sm:w-48 border font-bold text-[10px] uppercase tracking-widest px-4 py-3 outline-none transition-all cursor-pointer shadow-sm ${getStatusColor(statusFilter || 'default')}`}
            >
              <option value="">All Statuses</option>
              <option value="pending" className="bg-navy-mid text-amber-600">Pending</option>
              <option value="confirmed" className="bg-navy-mid text-sky-600">Confirmed</option>
              <option value="processing" className="bg-navy-mid text-purple-600">Processing</option>
              <option value="shipped" className="bg-navy-mid text-sky-600">Shipped</option>
              <option value="delivered" className="bg-navy-mid text-emerald-700">Delivered</option>
              <option value="cancelled" className="bg-navy-mid text-red-600">Cancelled</option>
              <option value="returned" className="bg-navy-mid text-red-600">Returned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="bg-navy-mid border border-navy-light shadow-sm flex flex-col min-h-[500px]">

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-dm skeleton-shimmer text-[15px]">Syncing database...</div>
          ) : orders.length === 0 ? (
            <div className="p-32 text-center text-gray-400 font-dm text-[12px] tracking-[0.3em] uppercase">
              <div className="text-6xl mb-6 opacity-20">📦</div>
              <h3 className="text-white font-playfair text-[26px] mb-2 font-bold">No Records Found</h3>
              <p className="text-gray-400">Adjust your search criteria to locate specific orders.</p>
            </div>
          ) : (
            <table className="w-full text-left text-[14px] whitespace-nowrap border-separate border-spacing-0">
              <thead className="bg-navy-mid text-gray-400 uppercase tracking-[0.2em] text-[10px] font-bold border-b border-navy-light">
                <tr>
                  <th className="px-4 py-5 w-10 text-center text-electric">#</th>
                  <th className="px-4 py-5">Order ID</th>
                  <th className="px-4 py-5">Date</th>
                  <th className="px-4 py-5">Customer & Shop Details</th>
                  <th className="px-4 py-5">City</th>
                  <th className="px-4 py-5">Payment Terms</th>
                  <th className="px-4 py-5">Total Amount</th>
                  <th className="px-4 py-5 text-center">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light">
                {orders.map((order, index) => (
                  <tr key={order._id} className="hover:bg-navy-light/30 transition-colors group">
                    <td className="px-4 py-6 text-center text-gray-400 font-bold text-[11px]">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-6">
                      <div className="font-bold text-white text-[15px] font-playfair">#{order.orderId || order.orderNumber || ''}</div>
                      <div className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-widest">{order.items.length} Product(s)</div>
                    </td>
                    <td className="px-4 py-6 text-gray-400 text-[12px] font-medium">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-[13px] uppercase tracking-wide">{order.ownerName || order.customerName || '—'}</span>
                        <span className="text-gray-300 text-[11px] font-medium">{order.shopName || order.customerAddress || '—'}</span>
                        <span className="text-gray-400 text-[10px]">{order.phone || order.customerPhone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-gray-400 text-[12px] font-medium">
                      {order.city || order.customerCity || '—'}
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="uppercase tracking-[0.1em] text-[10px] font-bold text-white">{order.paymentSchedule || order.paymentMethod || 'COD'}</span>
                        <span className={`inline-block w-fit px-3 py-1 rounded-full text-[9px] uppercase font-bold border ${getStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-6 font-bold text-white font-playfair text-[20px]">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-6 text-center">
                      <div className="flex justify-center">
                        <div className="relative inline-block w-full max-w-[180px]">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={isUpdating}
                            className={`w-full text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl px-4 py-3 outline-none border transition-all cursor-pointer text-center appearance-none ${getStatusColor(order.orderStatus)}`}
                          >
                            <option value="pending" className="bg-navy-mid text-amber-400 font-bold">PENDING</option>
                            <option value="confirmed" className="bg-navy-mid text-sky-400 font-bold">CONFIRMED</option>
                            <option value="processing" className="bg-navy-mid text-amber-400 font-bold">PROCESSING</option>
                            <option value="shipped" className="bg-navy-mid text-sky-400 font-bold">SHIPPED</option>
                            <option value="delivered" className="bg-navy-mid text-emerald-400 font-bold">DELIVERED</option>
                            <option value="cancelled" className="bg-navy-mid text-red-400 font-bold">CANCELLED</option>
                            <option value="returned" className="bg-navy-mid text-red-400 font-bold">RETURNED</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 2. ADVANCED PAGINATION FOOTER */}
        <div className="p-4 border-t border-navy-light flex flex-col md:flex-row justify-between items-center gap-6 bg-navy-mid">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
              Showing Page {Math.max(0, page - 1)} of {Math.max(0, totalPages - 1)}
            </span>
            
            <div className="flex items-center gap-3 border-l border-navy-light pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rows:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="bg-navy-mid border border-navy-light text-[11px] font-black px-3 py-1 outline-none focus:border-gold transition-colors cursor-pointer"
              >
                {[10, 20, 30, 50, 100].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-12 h-12 flex items-center justify-center border border-navy-light bg-navy-mid text-white hover:bg-navy-light hover:text-white disabled:opacity-20 transition-all font-bold"
            >
              &larr;
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-12 h-12 flex items-center justify-center border border-navy-light bg-navy-mid text-white hover:bg-navy-light hover:text-white disabled:opacity-20 transition-all font-bold"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default AdminOrders;
