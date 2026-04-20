import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetOrdersQuery } from '../../store/api/ordersApi';
import { useGetAdminProductsQuery, useGetLowStockProductsQuery } from '../../store/api/productsApi';
import { formatPrice } from '../../utils/formatPrice';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // --- DATE FILTER STATE ---
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);

  // --- DATA FETCHING ---
  // 1. All orders for the selected period
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery({
    page: 1, limit: 100,
    dateFrom,
    dateTo
  });

  // 2. All products for inventory stats
  const { data: productsResult, isLoading: productsLoading } = useGetAdminProductsQuery({ page: 1, limit: 100 });
  
  // 3. Specific low-stock products
  const { data: lowStockResult } = useGetLowStockProductsQuery();

  // 4. Pending orders for quick alerts (fixed at 50 limit)
  const { data: pendingOrdersResult } = useGetOrdersQuery({
    orderStatus: 'pending', page: 1, limit: 50
  });

  // --- HELPERS ---
  const handleDatePreset = (preset: 'today' | 'yesterday' | 'week' | 'month') => {
    const now = new Date();
    let from = new Date();
    let to = new Date();

    if (preset === 'yesterday') {
      from.setDate(now.getDate() - 1);
      to.setDate(now.getDate() - 1);
    } else if (preset === 'week') {
      // Monday of current week
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      from.setDate(diff);
    } else if (preset === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const fStr = from.toISOString().split('T')[0];
    const tStr = to.toISOString().split('T')[0];
    
    setDateFrom(fStr);
    setDateTo(tStr);
    setDateFilter(preset);
  };

  // --- CALCULATED STATS ---
  const stats = useMemo(() => {
    const orders = ordersData?.data?.orders || [];
    const products = productsResult?.data?.products || [];
    const lowStockItems = lowStockResult?.data || [];

    const pendingCount = pendingOrdersResult?.data?.total || 0;
    
    // Status counts for visible period
    const confirmedCount = orders.filter(o => o.orderStatus === 'confirmed').length;
    const shippedCount = orders.filter(o => o.orderStatus === 'shipped').length;
    const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;

    // Financials
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    
    const todayRevenue = orders
      .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    // Filtered period summaries
    const codCount = orders.filter(o => o.paymentMethod === 'cod').length;
    const onlineCount = orders.length - codCount;

    // Urgent Issues
    const paymentPending = orders.filter(
      o => o.paymentStatus === 'pending' &&
      ['jazzcash', 'easypaisa', 'bank_transfer'].includes(o.paymentMethod || '')
    );
    
    const paymentPendingTotal = paymentPending.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const outOfStock = products.filter(p => p.stock === 0);
    const visibleProducts = products.filter(p => p.isVisible);

    const todayOrdersList = orders.filter(
      o => new Date(o.createdAt).toDateString() === new Date().toDateString()
    );

    return {
      pendingCount, confirmedCount, shippedCount, deliveredCount,
      todayRevenue, totalRevenue, paymentPending, paymentPendingTotal,
      lowStockProducts: lowStockItems, outOfStock, visibleProducts,
      todayOrdersList, totalOrders: orders.length,
      totalProducts: productsResult?.data?.total || products.length,
      codCount, onlineCount
    };
  }, [ordersData, productsResult, lowStockResult, pendingOrdersResult]);

  // --- ALERTS ---
  const alerts = useMemo(() => {
    const items = [];
    if (stats.outOfStock.length > 0) items.push(`${stats.outOfStock.length} products out of stock`);
    if (stats.pendingCount > 0) items.push(`${stats.pendingCount} pending orders need confirmation`);
    if (stats.paymentPending.length > 0) items.push(`${stats.paymentPending.length} payments need verification`);
    return items;
  }, [stats]);

  if (ordersLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B8860B]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F5F0] min-h-screen p-6 font-dm text-[#1A1714]">
      
      {/* 1. ALERT STRIP */}
      {alerts.length > 0 && (
        <div className="bg-[#FEF3C7] border border-[#F59E0B] p-4 mb-8 flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
            <span className="text-sm font-bold uppercase tracking-wider text-[#92400E]">
              System Alerts: {alerts.join(' • ')}
            </span>
          </div>
          <button 
            onClick={() => navigate('/admin/orders?status=pending')}
            className="text-[11px] font-black uppercase tracking-widest text-[#B8860B] hover:underline"
          >
            Review Now →
          </button>
        </div>
      )}

      {/* 2. HEADER & DATE FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-black mb-2 uppercase tracking-tighter">Command Center</h1>
          <p className="text-[#9C9890] text-sm uppercase tracking-widest font-bold">Performance Analytics Overview</p>
        </div>

        <div className="bg-white border border-[#E8E4DC] p-2 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex gap-1">
            {['today', 'yesterday', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => handleDatePreset(p as any)}
                className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest transition-all ${
                  dateFilter === p ? 'bg-[#1A1714] text-[#B8860B]' : 'hover:bg-[#F7F5F0] text-[#9C9890]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-[#E8E4DC] hidden sm:block"></div>
          <div className="flex gap-2 items-center px-2">
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => { setDateFrom(e.target.value); setDateFilter('custom'); }}
              className="text-[11px] font-bold outline-none border-b border-transparent focus:border-[#B8860B]" 
            />
            <span className="text-[#9C9890]">to</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => { setDateTo(e.target.value); setDateFilter('custom'); }}
              className="text-[11px] font-bold outline-none border-b border-transparent focus:border-[#B8860B]" 
            />
          </div>
        </div>
      </div>

      {/* 3. ROW 1 — 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Pending */}
        <div className={`bg-white p-6 border border-[#E8E4DC] shadow-sm ${stats.pendingCount > 0 ? 'border-l-[3px] border-l-[#EF4444]' : 'border-l-[3px] border-l-[#B8860B]'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9C9890] mb-1">Pending Orders</p>
          <h2 className="text-3xl font-playfair font-black mb-1">{stats.pendingCount}</h2>
          <p className="text-[11px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">Needs confirmation</p>
        </div>

        {/* Card 2: Today Revenue */}
        <div className="bg-white p-6 border border-[#E8E4DC] border-l-[3px] border-l-[#B8860B] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9C9890] mb-1">Today's Revenue</p>
          <h2 className="text-3xl font-playfair font-black mb-1 text-[#B8860B]">{formatPrice(stats.todayRevenue)}</h2>
          <p className="text-[11px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">{stats.todayOrdersList.length} orders today</p>
        </div>

        {/* Card 3: Low Stock */}
        <div className={`bg-white p-6 border border-[#E8E4DC] shadow-sm ${stats.lowStockProducts.length > 0 ? 'border-l-[3px] border-l-[#F59E0B]' : 'border-l-[3px] border-l-[#22C55E]'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9C9890] mb-1">Inventory Alerts</p>
          <h2 className="text-3xl font-playfair font-black mb-1">{stats.lowStockProducts.length} items</h2>
          <p className="text-[11px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">{stats.outOfStock.length} out of stock</p>
        </div>

        {/* Card 4: Products */}
        <div className="bg-white p-6 border border-[#E8E4DC] border-l-[3px] border-l-[#1A1714] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9C9890] mb-1">Total Catalog</p>
          <h2 className="text-3xl font-playfair font-black mb-1">{stats.totalProducts}</h2>
          <p className="text-[11px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">
            {stats.visibleProducts.length} visible • {stats.totalProducts - stats.visibleProducts.length} hidden
          </p>
        </div>
      </div>

      {/* 4. ROW 2 — 3 SECONDARY STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Total Orders / Efficiency */}
        <div className="bg-white p-8 border border-[#E8E4DC] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9C9890] mb-1">Total Orders</p>
              <h3 className="text-4xl font-playfair font-black">{stats.totalOrders}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#22C55E]">Delivered: {stats.deliveredCount}</p>
              <p className="text-xs font-dm font-bold text-[#1A1714]">{Math.round((stats.deliveredCount / (stats.totalOrders || 1)) * 100)}% Fulfilment</p>
            </div>
          </div>
          <div className="w-full h-1 bg-[#F7F5F0]">
            <div 
              className="h-full bg-[#B8860B]" 
              style={{ width: `${(stats.deliveredCount / (stats.totalOrders || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Financial Period Revenue */}
        <div className="bg-white p-8 border border-[#E8E4DC] shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9C9890] mb-1 uppercase">Period Revenue</p>
          <h3 className="text-4xl font-playfair font-black mb-6">{formatPrice(stats.totalRevenue)}</h3>
          <div className="w-full h-1 bg-[#F7F5F0]">
            <div className="h-full bg-[#1A1714]" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Verification Alert */}
        <div className={`bg-white p-8 border border-[#E8E4DC] shadow-sm relative overflow-hidden ${stats.paymentPending.length > 0 ? 'bg-amber-50/30' : ''}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9C9890] mb-1">Pending Ledger</p>
              <h3 className="text-4xl font-playfair font-black text-[#EF4444]">{stats.paymentPending.length}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B]">Verification Value</p>
              <p className="text-xs font-dm font-bold text-[#1A1714]">{formatPrice(stats.paymentPendingTotal)}</p>
            </div>
          </div>
          <div className="w-full h-1 bg-[#F7F5F0]">
            <div 
              className="h-full bg-amber-400" 
              style={{ width: stats.paymentPending.length > 0 ? '60%' : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* 5. MAIN GRID */}
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* LEFT: RECENT ORDERS */}
        <div className="flex-1 bg-white border border-[#E8E4DC] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E8E4DC] flex justify-between items-center bg-[#FAF9F6]">
            <div className="flex items-center gap-4">
              <h2 className="font-playfair text-xl font-black uppercase tracking-tight">Recent Orders</h2>
              <span className="bg-[#B8860B] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                {stats.pendingCount} New
              </span>
            </div>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-[10px] font-black uppercase tracking-widest text-[#B8860B] hover:underline"
            >
              View Full Report →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FBF6E9]/50">
                  <th className="px-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#9C9890] border-b border-[#E8E4DC]">Order Detail</th>
                  <th className="px-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#9C9890] border-b border-[#E8E4DC]">Customer Info</th>
                  <th className="px-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#9C9890] border-b border-[#E8E4DC]">Inventory Items</th>
                  <th className="px-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#9C9890] border-b border-[#E8E4DC]">Payment</th>
                  <th className="px-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#9C9890] border-b border-[#E8E4DC]">Validation</th>
                </tr>
              </thead>
              <tbody>
                {(ordersData?.data?.orders || []).slice(0, 10).map((order) => (
                  <tr 
                    key={order._id} 
                    onClick={() => navigate(`/admin/orders?highlight=${order._id}`)}
                    className="group hover:bg-[#F7F5F0] transition-colors cursor-pointer border-b border-[#F7F5F0] last:border-0"
                  >
                    <td className="px-2 py-4">
                      <p className="text-[11px] font-black text-[#B8860B] mb-0.5">#{order.orderNumber}</p>
                      <p className="text-[10px] text-[#9C9890] font-bold">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-2 py-4">
                      <p className="text-[12px] font-black leading-tight">{order.customerName}</p>
                      <p className="text-[10px] text-[#9C9890] font-bold">{order.customerPhone}</p>
                    </td>
                    <td className="px-2 py-4">
                      <div className="space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="text-[10px] font-bold">
                            <span className="uppercase">{item.name}</span> × {item.quantity}
                            <span className="ml-2 text-[#9C9890]">[S:{item.size} C:{item.color}]</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <p className="font-playfair text-[13px] font-black text-[#B8860B] mb-1">{formatPrice(order.totalAmount)}</p>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                        order.paymentMethod === 'cod' ? 'bg-[#F7F5F0] text-[#9C9890]' :
                        order.paymentMethod === 'jazzcash' ? 'bg-orange-100/50 text-orange-600' :
                        order.paymentMethod === 'easypaisa' ? 'bg-green-100/50 text-green-600' :
                        'bg-blue-100/50 text-blue-600'
                      }`}>
                        {order.paymentMethod === 'cod' ? 'C.O.D' : order.paymentMethod?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <span className={`text-[9px] px-3 py-1 font-black uppercase tracking-widest ${
                        order.orderStatus === 'pending' ? 'bg-orange-50 text-orange-600' :
                        order.orderStatus === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                        order.orderStatus === 'processing' ? 'bg-purple-50 text-purple-600' :
                        order.orderStatus === 'shipped' ? 'bg-indigo-50 text-indigo-600' :
                        order.orderStatus === 'delivered' ? 'bg-green-50 text-green-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!ordersData?.data?.orders || ordersData?.data?.orders.length === 0) && (
            <div className="p-12 text-center">
              <p className="text-[#9C9890] text-xs font-black uppercase tracking-[0.2em]">Zero orders logged for this period</p>
            </div>
          )}
        </div>

        {/* RIGHT PANELS */}
        <div className="w-full xl:w-[340px] space-y-6">
          
          {/* PANEL 1: QUICK ACTIONS */}
          <div className="bg-white border border-[#E8E4DC] p-6 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1714] mb-6">Strategy Panel</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Item', icon: 'plus', onClick: () => navigate('/admin/products/add') },
                { label: 'All Orders', icon: 'list', onClick: () => navigate('/admin/orders') },
                { label: 'Verification', icon: 'shield', onClick: () => navigate('/admin/orders?filter=pending-payment') },
                { label: 'Live Store', icon: 'eye', onClick: () => window.open('/', '_blank') }
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.onClick}
                  className="bg-[#FAF9F6] border border-[#E8E4DC] p-4 flex flex-col items-center justify-center gap-2 hover:border-[#B8860B] hover:bg-[#FBF6E9] transition-all group"
                >
                  <div className="text-[#B8860B] group-hover:scale-110 transition-transform">
                    {btn.icon === 'plus' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
                    {btn.icon === 'list' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    {btn.icon === 'shield' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                    {btn.icon === 'eye' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PANEL 2: LOW STOCK */}
          <div className="bg-white border border-[#E8E4DC] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${stats.lowStockProducts.length > 0 ? 'text-[#EF4444]' : 'text-[#1A1714]'}`}>
                Low Stock Alert
              </h3>
              <button 
                onClick={() => navigate('/admin/products')}
                className="text-[9px] font-black uppercase tracking-widest text-[#B8860B] hover:underline"
              >
                Manage →
              </button>
            </div>
            
            <div className="space-y-4">
              {stats.lowStockProducts.slice(0, 6).map((item) => (
                <div key={item._id} className="flex justify-between items-center group">
                  <div>
                    <p className="text-[11px] font-black group-hover:text-[#B8860B] transition-colors uppercase truncate max-w-[180px]">{item.name}</p>
                    <p className="text-[9px] text-[#9C9890] font-bold uppercase tracking-widest">{item.category}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-sm text-[10px] font-black ${
                    item.stock === 0 ? 'bg-red-100 text-red-600' :
                    item.stock <= 5 ? 'text-red-600 underline' :
                    'text-amber-600'
                  }`}>
                    {item.stock === 0 ? 'OUT' : item.stock}
                  </div>
                </div>
              ))}
              {stats.lowStockProducts.length === 0 && (
                <p className="text-[#22C55E] text-[10px] font-black uppercase text-center py-4 tracking-widest">All products well stocked ✓</p>
              )}
            </div>
          </div>

          {/* PANEL 3: TODAY SUMMARY */}
          <div className="bg-[#1A1714] border border-[#1A1714] p-6 shadow-lg text-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B8860B]">Daily Report</h3>
              <span className="text-[10px] font-bold text-white/50">{new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
            </div>
            
            <div className="space-y-4 font-dm">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">New Traffic</span>
                <span className="text-sm font-black">{stats.todayOrdersList.length} Orders</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Revenue</span>
                <span className="text-sm font-black text-[#C9A84C] font-playfair">{formatPrice(stats.todayRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">C.O.D Utilization</span>
                <span className="text-sm font-bold">{stats.codCount} Trans.</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Digital Payment</span>
                <span className="text-sm font-bold">{stats.onlineCount} Trans.</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Dispatched Today</span>
                <span className="text-sm font-bold text-green-400">{stats.shippedCount + stats.deliveredCount} Units</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-widest">Pending Action</span>
                <span className="text-sm font-bold text-[#EF4444]">{stats.pendingCount} Red</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
