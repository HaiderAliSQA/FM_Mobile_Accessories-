// frontend/src/pages/admin/AdminShopKeepers.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetShopKeepersQuery, useCreateShopKeeperMutation, useUpdateShopKeeperMutation } from '../../store/api/wholesaleApi';
import { ShopKeeper } from '../../types';
import toast from 'react-hot-toast';

const AdminShopKeepers: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShopKeeper, setEditingShopKeeper] = useState<ShopKeeper | null>(null);

  const { data, isLoading, isFetching } = useGetShopKeepersQuery({ page, limit: 20, search: search || undefined });
  const [createSK, { isLoading: isCreating }] = useCreateShopKeeperMutation();
  const [updateSK, { isLoading: isUpdating }] = useUpdateShopKeeperMutation();

  const shopKeepers = data?.data?.shopKeepers || [];
  const summary = data?.data?.summary || { totalCount: 0, totalActiveCount: 0, totalDueAll: 0, thisMonthCollected: 0 };
  const totalPages = data?.data?.pages || 1;

  const [form, setForm] = useState({ name: '', shopName: '', phone: '', whatsapp: '', city: '', address: '', creditLimit: '100000', notes: '' });

  const resetForm = () => setForm({ name: '', shopName: '', phone: '', whatsapp: '', city: '', address: '', creditLimit: '100000', notes: '' });

  const openAdd = () => { resetForm(); setEditingShopKeeper(null); setShowModal(true); };
  const openEdit = (sk: ShopKeeper) => {
    setForm({ name: sk.name, shopName: sk.shopName, phone: sk.phone, whatsapp: sk.whatsapp || '', city: sk.city, address: sk.address || '', creditLimit: String(sk.creditLimit), notes: sk.notes || '' });
    setEditingShopKeeper(sk);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, creditLimit: Number(form.creditLimit) };
    try {
      if (editingShopKeeper) {
        await updateSK({ id: editingShopKeeper._id, ...payload }).unwrap();
        toast.success('Shop keeper updated!');
      } else {
        await createSK(payload).unwrap();
        toast.success('Shop keeper added!');
      }
      setShowModal(false); resetForm();
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed');
    }
  };

  const getStatusColor = (sk: ShopKeeper) => {
    if (sk.totalDue === 0) return 'text-emerald-400 font-bold';
    if (sk.totalDue > sk.creditLimit * 0.8) return 'text-red-400 font-bold';
    return 'text-red-400 font-bold';
  };

  return (
    <div className="animate-fadeIn font-dm">
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-navy-dark pb-4 pt-4 px-6 border-b border-navy-light shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-white text-3xl font-bold">Shop Keepers</h1>
            <p className="text-gray-400 tracking-widest text-[10px] uppercase font-bold mt-1">Wholesale Account Management</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shops, names, phones..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-navy-mid border border-navy-light px-10 py-2.5 text-[13px] text-white placeholder-gray-500 outline-none focus:border-electric transition-all rounded-lg w-64"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button onClick={openAdd} className="bg-electric text-white px-5 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Shop Keeper
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 pt-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Shop Keepers', value: summary.totalCount, color: 'border-l-electric', icon: '🏪' },
            { label: 'Active Accounts', value: summary.totalActiveCount, color: 'border-l-emerald-500', icon: '✅' },
            { label: 'Total Due', value: `PKR ${(summary.totalDueAll || 0).toLocaleString()}`, color: 'border-l-red-500', icon: '⚠️', highlight: true },
            { label: 'This Month Collected', value: `PKR ${(summary.thisMonthCollected || 0).toLocaleString()}`, color: 'border-l-emerald-500', icon: '💰' },
          ].map((card) => (
            <div key={card.label} className={`bg-navy-mid border border-navy-light border-l-4 ${card.color} p-5 rounded-xl`}>
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.label}</p>
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className={`text-2xl font-bold font-heading ${card.highlight ? 'text-red-400' : 'text-white'}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-navy-mid border border-navy-light rounded-xl overflow-hidden">
          {isLoading || isFetching ? (
            <div className="p-16 text-center text-gray-400 text-[13px]">Loading shop keepers...</div>
          ) : shopKeepers.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-5xl mb-4 opacity-20">🏪</div>
              <p className="text-white font-heading text-xl font-bold mb-2">No Shop Keepers Yet</p>
              <p className="text-gray-400 text-sm">Click "+ Add Shop Keeper" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="border-b border-navy-light bg-navy-dark/50">
                  <tr>
                    {['Shop Name', 'Owner', 'City', 'Phone', 'Total Due', 'Credit Limit', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-light">
                  {shopKeepers.map((sk) => {
                    const duePct = sk.creditLimit > 0 ? (sk.totalDue / sk.creditLimit) * 100 : 0;
                    return (
                      <tr key={sk._id} className="hover:bg-navy-light/20 transition-colors group">
                        <td className="px-4 py-4">
                          <p className="text-white font-bold text-[14px]">{sk.shopName}</p>
                          <p className="text-gray-500 text-[10px]">Joined {new Date(sk.joinedAt).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-300 text-[13px] font-medium">{sk.name}</td>
                        <td className="px-4 py-4 text-gray-300 text-[13px]">{sk.city}</td>
                        <td className="px-4 py-4 text-gray-300 text-[12px] font-mono">{sk.phone}</td>
                        <td className="px-4 py-4">
                          <span className={getStatusColor(sk)}>
                            {sk.totalDue === 0 ? '✅ Clear' : `PKR ${sk.totalDue.toLocaleString()}`}
                          </span>
                          {duePct >= 80 && sk.totalDue > 0 && (
                            <span className="ml-2 text-amber-400 text-sm" title="Near credit limit">⚠️</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-[13px]">PKR {sk.creditLimit.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${sk.isActive ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-red-900/40 text-red-400 border border-red-800'}`}>
                            {sk.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/admin/shopkeepers/${sk._id}`)} className="px-3 py-1.5 bg-electric/20 text-electric border border-electric/30 rounded-lg text-[11px] font-bold hover:bg-electric hover:text-white transition-all">
                              View Ledger
                            </button>
                            <button onClick={() => openEdit(sk)} className="px-3 py-1.5 bg-navy-dark border border-navy-light rounded-lg text-[11px] font-bold text-gray-300 hover:border-gray-500 transition-all">
                              Edit
                            </button>
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-navy-mid border border-navy-light rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-navy-light flex items-center justify-between">
              <h2 className="font-heading text-white text-xl font-bold">{editingShopKeeper ? 'Edit Shop Keeper' : 'Add Shop Keeper'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-navy-light">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Owner Name *', key: 'name', placeholder: 'Muhammad Arif', required: true },
                  { label: 'Shop Name *', key: 'shopName', placeholder: 'Karachi Phones', required: true },
                  { label: 'Phone *', key: 'phone', placeholder: '0312-XXXXXXX', required: true },
                  { label: 'WhatsApp', key: 'whatsapp', placeholder: '0312-XXXXXXX', required: false },
                  { label: 'City *', key: 'city', placeholder: 'Karachi', required: true },
                  { label: 'Credit Limit (PKR)', key: 'creditLimit', placeholder: '100000', required: false },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">{f.label}</label>
                    <input
                      type={f.key === 'creditLimit' ? 'number' : 'text'}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      required={f.required}
                      className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all placeholder-gray-600"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Shop 14, Mobile Market, Saddar" className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all placeholder-gray-600" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Private notes about this shop keeper..." rows={2} className="w-full bg-navy-dark border border-navy-light px-3 py-2.5 text-white text-[13px] rounded-lg outline-none focus:border-electric transition-all placeholder-gray-600 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-navy-light text-gray-300 hover:text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-all">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-1 bg-electric text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  {(isCreating || isUpdating) ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : (editingShopKeeper ? 'Update' : 'Add Shop Keeper')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShopKeepers;
