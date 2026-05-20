import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../../store/api/ordersApi';
import { useGetDashboardStatsQuery } from '../../store/api/adminApi';
import { Order } from '../../types';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';
import AddOrderPaymentModal from './components/AddOrderPaymentModal';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'customer' | 'wholesale'>('customer');

  const { data: statsRes } = useGetDashboardStatsQuery();
  const stats = statsRes?.data;

  const { data, isLoading } = useGetOrdersQuery({
    page,
    limit,
    search,
    orderStatus: statusFilter || undefined,
    paymentStatus: paymentStatusFilter || undefined,
    orderType: activeTab,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = data?.data?.orders || [];
  const totalPages = data?.data?.pages || 1;

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, orderStatus: newStatus }).unwrap();
      toast.success('Order status updated successfully');
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
      case 'partial':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/60';
      case 'unpaid':
      default:
        return 'bg-red-950/40 text-red-400 border-red-800/60';
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
      case 'pending':
      case 'processing':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/60';
      case 'confirmed':
      case 'shipped':
        return 'bg-sky-950/40 text-sky-400 border-sky-800/60';
      case 'cancelled':
        return 'bg-red-950/40 text-red-400 border-red-800/60';
      default:
        return 'bg-navy-dark text-gray-400 border-navy-light';
    }
  };

  return (
    <div className="animate-fadeIn font-dm relative">
      {/* 1. FIXED PAGE HEADER */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-heading text-white text-3xl font-bold">Storefront Orders</h1>
            <p className="text-gray-400 tracking-[0.2em] text-[10px] uppercase font-bold">
              Fulfillment Center • {data?.data?.total || 0} transactions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search shop, phone, city, order ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-navy-mid border border-navy-light px-10 py-2.5 text-[13px] text-white placeholder-gray-500 outline-none focus:border-electric transition-all rounded-lg"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-navy-mid border border-navy-light px-4 py-2.5 text-[12px] font-bold text-white rounded-lg outline-none cursor-pointer focus:border-electric transition-all"
            >
              <option value="">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-navy-mid border border-navy-light px-4 py-2.5 text-[12px] font-bold text-white rounded-lg outline-none cursor-pointer focus:border-electric transition-all"
            >
              <option value="">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 pt-6 space-y-6">
        {/* 2. SUMMARY KPI BAR */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-navy-mid border border-navy-light border-l-4 border-l-electric p-5 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold font-heading text-white mt-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-navy-mid border border-navy-light border-l-4 border-l-electric p-5 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold font-heading text-white mt-1">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="bg-navy-mid border border-navy-light border-l-4 border-l-emerald-500 p-5 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Collected</p>
              <p className="text-2xl font-bold font-heading text-emerald-400 mt-1">{formatPrice(stats.totalCollected)}</p>
            </div>
            <div className="bg-navy-mid border border-navy-light border-l-4 border-l-red-500 p-5 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Total Due 🔴</p>
              <p className="text-2xl font-bold font-heading text-red-400 mt-1">{formatPrice(stats.totalDue)}</p>
            </div>
          </div>
        )}

        {/* ORDER TYPE TABS */}
        <div className="flex gap-6 border-b border-navy-light pb-0.5">
          <button
            onClick={() => {
              setActiveTab('customer');
              setPage(1);
            }}
            className={`pb-3 text-xs md:text-sm font-extrabold uppercase tracking-widest transition-all relative cursor-pointer ${
              activeTab === 'customer'
                ? 'text-electric font-black'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <span>Customer Orders</span>
            {activeTab === 'customer' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric shadow-glow-blue rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('wholesale');
              setPage(1);
            }}
            className={`pb-3 text-xs md:text-sm font-extrabold uppercase tracking-widest transition-all relative cursor-pointer ${
              activeTab === 'wholesale'
                ? 'text-electric font-black'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <span>Wholesale Orders</span>
            {activeTab === 'wholesale' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric shadow-glow-blue rounded-t-full" />
            )}
          </button>
        </div>

        {/* 3. ORDERS TABLE */}
        <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-16 text-center text-gray-400 text-[13px]">Syncing standard database...</div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-5xl mb-4 opacity-20">📦</div>
              <p className="text-white font-heading text-xl font-bold mb-2">No Customer Orders Found</p>
              <p className="text-gray-400 text-sm">Create storefront checkouts to populate this portal.</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left whitespace-nowrap text-[13px]">
                <thead className="border-b border-navy-light bg-navy-dark/50">
                  <tr>
                    {(activeTab === 'customer'
                      ? [
                          'Order ID',
                          'Shop Name',
                          'Phone',
                          'City',
                          'Product',
                          'Qty',
                          'Total (PKR 200 TCS)',
                          'Payment Status',
                          'Order Status',
                          'Date',
                          'Actions',
                        ]
                      : [
                          'Order ID',
                          'Shop Name',
                          'Phone',
                          'City',
                          'Items',
                          'Total',
                          'Paid',
                          'Due',
                          'Payment Status',
                          'Order Status',
                          'Date',
                          'Actions',
                        ]
                    ).map((h) => (
                      <th key={h} className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-light/60">
                  {orders.map((order) => {
                    const shopName = order.shopName || order.customerAddress || '—';
                    const ownerName = order.ownerName || order.customerName || '—';
                    const phone = order.phone || order.customerPhone || '—';
                    const city = order.city || order.customerCity || '—';

                    if (activeTab === 'customer') {
                      const product = order.items[0]?.name || '—';
                      const qty = order.items.reduce((sum, item) => sum + item.quantity, 0);

                      return (
                        <tr key={order._id} className="hover:bg-navy-light/20 transition-colors">
                          <td className="px-4 py-4.5 font-mono font-bold text-electric">
                            {order.orderId || order.orderNumber || '—'}
                          </td>
                          <td className="px-4 py-4.5">
                            <p className="text-white font-bold uppercase tracking-wide">{shopName}</p>
                            <p className="text-gray-400 text-[10px]">{ownerName}</p>
                          </td>
                          <td className="px-4 py-4.5 text-gray-400 font-mono text-[12px]">{phone}</td>
                          <td className="px-4 py-4.5 text-gray-300 font-medium">{city}</td>
                          <td className="px-4 py-4.5 text-gray-300 font-medium truncate max-w-[200px]" title={product}>
                            {product}
                          </td>
                          <td className="px-4 py-4.5 text-gray-300 font-medium">{qty}</td>
                          <td className="px-4 py-4.5 text-white font-bold">{formatPrice(order.totalAmount)}</td>
                          <td className="px-4 py-4.5">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getPaymentStatusBadge(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4.5">
                            <div className="relative inline-block w-36">
                              <select
                                value={order.orderStatus}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className={`w-full text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${getOrderStatusBadge(order.orderStatus)}`}
                              >
                                <option value="pending" className="bg-navy-mid">Pending</option>
                                <option value="confirmed" className="bg-navy-mid">Confirmed</option>
                                <option value="processing" className="bg-navy-mid">Processing</option>
                                <option value="shipped" className="bg-navy-mid">Shipped</option>
                                <option value="delivered" className="bg-navy-mid">Delivered</option>
                                <option value="cancelled" className="bg-navy-mid">Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-4.5 text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-PK', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                          <td className="px-4 py-4.5">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                className="px-3 py-1.5 bg-navy-dark border border-navy-light text-gray-300 hover:border-gray-500 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                              >
                                View
                              </button>
                              {order.paymentStatus !== 'paid' && (
                                <button
                                  onClick={() => setSelectedPaymentOrder(order)}
                                  className="px-3 py-1.5 bg-electric text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-all cursor-pointer"
                                >
                                  +Pay
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

                      return (
                        <tr key={order._id} className="hover:bg-navy-light/20 transition-colors">
                          <td className="px-4 py-4.5 font-mono font-bold text-electric">
                            {order.orderId || order.orderNumber || '—'}
                          </td>
                          <td className="px-4 py-4.5">
                            <p className="text-white font-bold uppercase tracking-wide">{shopName}</p>
                            <p className="text-gray-400 text-[10px]">{ownerName}</p>
                          </td>
                          <td className="px-4 py-4.5 text-gray-400 font-mono text-[12px]">{phone}</td>
                          <td className="px-4 py-4.5 text-gray-300 font-medium">{city}</td>
                          <td className="px-4 py-4.5 text-gray-300 font-medium">{totalItems} item(s)</td>
                          <td className="px-4 py-4.5 text-white font-bold">{formatPrice(order.totalAmount)}</td>
                          <td className="px-4 py-4.5 text-emerald-400 font-bold">{formatPrice(order.totalPaid || 0)}</td>
                          <td className="px-4 py-4.5">
                            <span className={order.totalDue === 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                              {order.totalDue === 0 ? 'Clear' : formatPrice(order.totalDue || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-4.5">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getPaymentStatusBadge(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4.5">
                            <div className="relative inline-block w-36">
                              <select
                                value={order.orderStatus}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className={`w-full text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border outline-none cursor-pointer ${getOrderStatusBadge(order.orderStatus)}`}
                              >
                                <option value="pending" className="bg-navy-mid">Pending</option>
                                <option value="confirmed" className="bg-navy-mid">Confirmed</option>
                                <option value="processing" className="bg-navy-mid">Processing</option>
                                <option value="shipped" className="bg-navy-mid">Shipped</option>
                                <option value="delivered" className="bg-navy-mid">Delivered</option>
                                <option value="cancelled" className="bg-navy-mid">Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-4.5 text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-PK', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                          <td className="px-4 py-4.5">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                className="px-3 py-1.5 bg-navy-dark border border-navy-light text-gray-300 hover:border-gray-500 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                              >
                                View
                              </button>
                              {order.paymentStatus !== 'paid' && (
                                <button
                                  onClick={() => setSelectedPaymentOrder(order)}
                                  className="px-3 py-1.5 bg-electric text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-all cursor-pointer"
                                >
                                  +Pay
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-navy-light flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center border border-navy-light text-white hover:bg-navy-light disabled:opacity-20 rounded-lg transition-all cursor-pointer"
                >
                  ←
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-navy-light text-white hover:bg-navy-light disabled:opacity-20 rounded-lg transition-all cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. ADD PAYMENT MODAL TRACING */}
      {selectedPaymentOrder && (
        <AddOrderPaymentModal
          order={selectedPaymentOrder}
          onClose={() => setSelectedPaymentOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminOrders;
