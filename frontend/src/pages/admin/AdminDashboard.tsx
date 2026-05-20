import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardStatsQuery } from '../../store/api/adminApi';
import { useGetPaymentsQuery } from '../../store/api/ordersApi';
import { formatPrice } from '../../utils/formatPrice';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsRes, isLoading: statsLoading, isFetching: statsFetching } = useGetDashboardStatsQuery();
  const { data: paymentsRes, isLoading: paymentsLoading } = useGetPaymentsQuery({ limit: 10 });

  const stats = statsRes?.data;
  const recentPayments = paymentsRes?.data || [];

  const isLoading = statsLoading || paymentsLoading || statsFetching;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 font-dm space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-electric border-t-transparent"></div>
        <p className="text-[11px] uppercase tracking-widest font-black">Syncing command center...</p>
      </div>
    );
  }

  // Fallbacks if stats are empty
  const totalOrders = stats?.totalOrders || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalCollected = stats?.totalCollected || 0;
  const totalDue = stats?.totalDue || 0;
  const unpaidOrders = stats?.unpaidOrders || 0;
  const partialOrders = stats?.partialOrders || 0;
  const recentOrders = stats?.recentOrders || [];
  const overdueOrders = stats?.overdueOrders || [];

  return (
    <div className="animate-fadeIn font-dm relative space-y-6">
      
      {/* HEADER & WHOLESALE BADGE */}
      <div className="flex items-center justify-between border-b border-navy-light pb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-white text-3xl font-bold">FH Mobile Accessories</h1>
          <span className="bg-electric text-white text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wider uppercase shadow-sm">
            WHOLESALE
          </span>
        </div>
        <p className="text-gray-400 tracking-[0.2em] text-[10px] uppercase font-bold hidden sm:block">
          Admin Portal • Live Balance Ledger
        </p>
      </div>

      {/* OVERDUE ALERTS BANNERS */}
      {overdueOrders.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <h3 className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
              Orders Needing Payment Follow-up
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-[12px]">
              <thead className="bg-navy-dark/40 border-b border-navy-light text-gray-400 font-bold uppercase text-[9px] tracking-widest">
                <tr>
                  <th className="px-4 py-3">Shop Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Remaining Due</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Days Since</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light/60">
                {overdueOrders.map((order) => {
                  const daysSince = Math.floor(
                    (Date.now() - new Date(order.createdAt).getTime()) / 86400000
                  );
                  return (
                    <tr key={order._id} className="hover:bg-navy-mid/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-white uppercase tracking-wide">
                        {order.shopName}
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-mono text-[11px]">
                        {order.phone}
                      </td>
                      <td className="px-4 py-3 text-right text-red-400 font-bold">
                        {formatPrice(order.totalDue)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-amber-500 font-bold">
                        {daysSince} Days
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="px-3 py-1 bg-electric/10 border border-electric/30 text-electric hover:bg-electric hover:text-white rounded-md text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Follow Up
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI CARDS GRID (2x3 Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {/* 1. Total Orders */}
        <div className="bg-navy-mid border border-navy-light p-5 rounded-xl shadow-xs border-l-4 border-l-electric">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Total Orders
          </p>
          <h3 className="text-2xl font-bold text-white font-heading">{totalOrders}</h3>
          <p className="text-[10px] text-gray-500 mt-1.5 uppercase font-bold tracking-wider">
            Guest Transactions
          </p>
        </div>

        {/* 2. Total Revenue */}
        <div className="bg-navy-mid border border-navy-light p-5 rounded-xl shadow-xs border-l-4 border-l-electric">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Total Revenue
          </p>
          <h3 className="text-2xl font-bold text-white font-heading">{formatPrice(totalRevenue)}</h3>
          <p className="text-[10px] text-gray-500 mt-1.5 uppercase font-bold tracking-wider">
            Gross B2B Booked
          </p>
        </div>

        {/* 3. Total Collected */}
        <div className="bg-navy-mid border border-navy-light p-5 rounded-xl shadow-xs border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Total Collected
          </p>
          <h3 className="text-2xl font-bold text-emerald-400 font-heading">
            {formatPrice(totalCollected)}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1.5 uppercase font-bold tracking-wider">
            Installments Clear
          </p>
        </div>

        {/* 4. Total Due (Red Highlight Card) */}
        <div className="bg-red-950/20 border border-red-900/40 p-5 rounded-xl shadow-xs border-l-4 border-l-red-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">
            Total Due 🔴
          </p>
          <h3 className="text-2xl font-bold text-red-400 font-heading">
            {formatPrice(totalDue)}
          </h3>
          <p className="text-[10px] text-red-500/80 mt-1.5 uppercase font-bold tracking-wider">
            Accounts Outstanding
          </p>
        </div>

        {/* 5. Unpaid Orders */}
        <div className="bg-navy-mid border border-navy-light p-5 rounded-xl shadow-xs border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Unpaid Orders
          </p>
          <h3 className="text-2xl font-bold text-white font-heading">{unpaidOrders}</h3>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-[9px] text-electric hover:underline font-bold uppercase tracking-widest mt-2 block"
          >
            Filter List &rarr;
          </button>
        </div>

        {/* 6. Partial Orders */}
        <div className="bg-navy-mid border border-navy-light p-5 rounded-xl shadow-xs border-l-4 border-l-amber-500">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Partial Paid
          </p>
          <h3 className="text-2xl font-bold text-white font-heading">{partialOrders}</h3>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-[9px] text-electric hover:underline font-bold uppercase tracking-widest mt-2 block"
          >
            View Ledgers &rarr;
          </button>
        </div>
      </div>

      {/* RECENT ORDERS & PAYMENTS (Split Layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* RECENT ORDERS PANEL */}
        <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-navy-light flex justify-between items-center bg-navy-mid shrink-0">
            <h3 className="font-heading text-white text-base font-bold">Recent Orders</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-[10px] font-black uppercase tracking-widest text-electric hover:underline cursor-pointer"
            >
              All Orders &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-[12px]">
              <thead className="bg-navy-dark/40 border-b border-navy-light text-gray-400 font-bold uppercase text-[9px] tracking-widest">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Shop Info</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light/60">
                {recentOrders.slice(0, 10).map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="hover:bg-navy-light/20 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-electric">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white font-bold uppercase tracking-wide">
                        {order.shopName}
                      </p>
                      <p className="text-gray-400 text-[10px]">{order.ownerName}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-white">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800' :
                        order.paymentStatus === 'partial' ? 'bg-amber-950/40 text-amber-400 border border-amber-800' :
                        'bg-red-950/40 text-red-400 border border-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500 font-bold uppercase tracking-widest">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT PAYMENTS PANEL */}
        <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-navy-light flex justify-between items-center bg-navy-mid shrink-0">
            <h3 className="font-heading text-white text-base font-bold">Recent Payments</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Collection ledger
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-[12px]">
              <thead className="bg-navy-dark/40 border-b border-navy-light text-gray-400 font-bold uppercase text-[9px] tracking-widest">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Shop Name</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light/60">
                {recentPayments.map((p) => {
                  const o = typeof p.order === 'object' ? p.order : null;
                  const orderIdStr = o?.orderId || p.orderId || '—';
                  const shopNameStr = p.shopName || o?.shopName || '—';
                  return (
                    <tr
                      key={p._id}
                      onClick={() => navigate(`/admin/orders/${o?._id || p.order}`)}
                      className="hover:bg-navy-light/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5 text-gray-400 font-medium">
                        {new Date(p.paymentDate || p.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-white font-bold uppercase tracking-wide">
                          {shopNameStr}
                        </p>
                        <p className="text-gray-400 text-[10px] font-mono">{p.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                        +{formatPrice(p.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-navy-dark text-gray-300 rounded-md border border-navy-light">
                          {p.method}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-400">
                        {orderIdStr}
                      </td>
                    </tr>
                  );
                })}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500 font-bold uppercase tracking-widest">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
