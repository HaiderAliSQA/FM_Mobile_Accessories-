// frontend/src/pages/admin/AdminShopKeeperLedger.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetShopKeeperLedgerQuery, useGetShopKeeperOrdersQuery, useGetShopKeeperPaymentsQuery } from '../../store/api/wholesaleApi';
import { LedgerEntry, WholesaleOrder, WholesalePayment } from '../../types';

type Tab = 'ledger' | 'orders' | 'payments';

const AdminShopKeeperLedger: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('ledger');

  const { data: ledgerData, isLoading } = useGetShopKeeperLedgerQuery(id!);
  const { data: ordersData } = useGetShopKeeperOrdersQuery({ id: id!, page: 1 }, { skip: activeTab !== 'orders' });
  const { data: paymentsData } = useGetShopKeeperPaymentsQuery({ id: id!, page: 1 }, { skip: activeTab !== 'payments' });

  const shopKeeper = ledgerData?.data?.shopKeeper;
  const ledger = (ledgerData?.data?.ledger || []) as LedgerEntry[];
  const summary = ledgerData?.data?.summary || { totalOrdered: 0, totalPaid: 0, totalDue: 0, orderCount: 0 };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-900/40 text-emerald-400 border border-emerald-800';
      case 'partial': return 'bg-amber-900/40 text-amber-400 border border-amber-800';
      default: return 'bg-red-900/40 text-red-400 border border-red-800';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-electric" /></div>;
  }

  if (!shopKeeper) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-400 text-lg">Shop keeper not found.</p>
        <button onClick={() => navigate('/admin/shopkeepers')} className="mt-4 text-electric hover:underline">← Back to Shop Keepers</button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn font-dm pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate('/admin/shopkeepers')} className="text-gray-400 hover:text-electric transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="font-heading text-white text-2xl font-bold">{shopKeeper.shopName} — Full Ledger</h1>
            <p className="text-gray-400 text-[11px] uppercase tracking-widest">
              {shopKeeper.name} | {shopKeeper.phone} | {shopKeeper.city}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Ordered', value: `PKR ${summary.totalOrdered.toLocaleString()}`, color: 'border-l-blue-500' },
            { label: 'Total Paid', value: `PKR ${summary.totalPaid.toLocaleString()}`, color: 'border-l-emerald-500' },
            { label: 'Current Due', value: `PKR ${summary.totalDue.toLocaleString()}`, color: 'border-l-red-500', highlight: summary.totalDue > 0 },
            { label: 'Total Orders', value: summary.orderCount, color: 'border-l-electric' },
          ].map((c) => (
            <div key={c.label} className={`bg-navy-mid border border-navy-light border-l-4 ${c.color} p-5 rounded-xl`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{c.label}</p>
              <p className={`text-2xl font-bold font-heading ${c.highlight ? 'text-red-400' : 'text-white'}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-navy-mid border border-navy-light p-1 rounded-xl w-fit">
          {(['ledger', 'orders', 'payments'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-electric text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {tab === 'ledger' ? '📊 All Ledger' : tab === 'orders' ? '📦 Orders' : '💰 Payments'}
            </button>
          ))}
        </div>

        {/* Tab: All Ledger */}
        {activeTab === 'ledger' && (
          <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-navy-light">
              <h3 className="text-white font-bold text-[13px] uppercase tracking-widest">Chronological Ledger (بہی کھاتہ)</h3>
            </div>
            {ledger.length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-sm">No ledger entries yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="border-b border-navy-light bg-navy-dark/50">
                    <tr>
                      {['Date', 'Type', 'Description', 'Amount', 'Running Due'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-light">
                    {ledger.map((entry, i) => (
                      <tr key={i} className={entry.type === 'order' ? 'bg-red-950/20' : 'bg-emerald-950/20'}>
                        <td className="px-4 py-3 text-gray-400 text-[12px]">
                          {new Date(entry.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${entry.type === 'order' ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'}`}>
                            {entry.type === 'order' ? '🛒 Order' : '✅ Payment'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white text-[13px]">{entry.description}</td>
                        <td className={`px-4 py-3 font-bold text-[14px] ${entry.type === 'order' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {entry.type === 'order' ? '-' : '+'} PKR {entry.amount.toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 font-bold text-[14px] ${entry.runningDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          PKR {entry.runningDue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
            {!ordersData ? (
              <div className="p-16 text-center text-gray-400">Loading...</div>
            ) : ordersData.data.orders.length === 0 ? (
              <div className="p-16 text-center text-gray-400">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="border-b border-navy-light bg-navy-dark/50">
                    <tr>
                      {['Order ID', 'Date', 'Total', 'Paid', 'Due', 'Payment Status', 'Order Status', 'Action'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-light">
                    {(ordersData.data.orders as WholesaleOrder[]).map((o) => (
                      <tr key={o._id} className="hover:bg-navy-light/20 transition-colors">
                        <td className="px-4 py-3 text-electric font-bold text-[13px]">{o.orderId}</td>
                        <td className="px-4 py-3 text-gray-400 text-[12px]">{new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</td>
                        <td className="px-4 py-3 text-white font-bold">PKR {o.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">PKR {o.totalPaid.toLocaleString()}</td>
                        <td className={`px-4 py-3 font-bold ${o.totalDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>PKR {o.totalDue.toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getPaymentStatusBadge(o.paymentStatus)}`}>{o.paymentStatus}</span></td>
                        <td className="px-4 py-3 text-gray-400 text-[12px] capitalize">{o.orderStatus}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => navigate(`/admin/wholesale-orders/${o._id}`)} className="text-electric text-[11px] font-bold hover:underline">View →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Payments */}
        {activeTab === 'payments' && (
          <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
            {!paymentsData ? (
              <div className="p-16 text-center text-gray-400">Loading...</div>
            ) : paymentsData.data.payments.length === 0 ? (
              <div className="p-16 text-center text-gray-400">No payments recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="border-b border-navy-light bg-navy-dark/50">
                    <tr>
                      {['#', 'Date', 'Amount', 'Method', 'Installment', 'Tx ID', 'Due After'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-light">
                    {(paymentsData.data.payments as WholesalePayment[]).map((p, i) => (
                      <tr key={p._id} className="hover:bg-navy-light/20 transition-colors">
                        <td className="px-4 py-3 text-gray-500 text-[12px] font-bold">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-400 text-[12px]">{new Date(p.paymentDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold text-[14px]">PKR {p.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-white text-[12px] capitalize">{p.method.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-gray-400 text-[12px]">{p.installmentNote || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-[11px] font-mono">{p.transactionId || '—'}</td>
                        <td className={`px-4 py-3 font-bold text-[13px] ${p.dueAfterThis > 0 ? 'text-red-400' : 'text-emerald-400'}`}>PKR {p.dueAfterThis.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate(`/admin/wholesale-orders/new?shopkeeper=${id}`)} className="bg-electric text-white px-6 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Order for {shopKeeper.shopName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminShopKeeperLedger;
