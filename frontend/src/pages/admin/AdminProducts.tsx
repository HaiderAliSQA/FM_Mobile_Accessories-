// frontend/src/pages/admin/AdminProducts.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetAdminProductsQuery,
  useToggleVisibilityMutation,
  useToggleDiscontinuedMutation,
  useToggleFeaturedMutation,
  useUpdateStockMutation,
  useDeleteProductMutation,
} from '../../store/api/productsApi';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

const AdminProducts: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockInputValue, setStockInputValue] = useState<string>('');
  
  const { data, isLoading } = useGetAdminProductsQuery({ page, limit, search });
  const [toggleVisibility] = useToggleVisibilityMutation();
  const [toggleDiscontinued] = useToggleDiscontinuedMutation();
  const [toggleFeatured] = useToggleFeaturedMutation();
  const [updateStock] = useUpdateStockMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data?.products || [];
  const totalPages = data?.data?.pages || 1;

  const handleToggle = async (id: string, action: 'visibility' | 'discontinued' | 'featured') => {
    try {
      if (action === 'visibility') await toggleVisibility(id).unwrap();
      if (action === 'discontinued') await toggleDiscontinued(id).unwrap();
      if (action === 'featured') await toggleFeatured(id).unwrap();
      toast.success(`Product ${action} updated`);
    } catch {
      toast.error(`Failed to update ${action}`);
    }
  };

  const handleStockEdit = (id: string, currentStock: number) => {
    setEditingStockId(id);
    setStockInputValue(String(currentStock));
  };

  const handleStockSave = async (id: string) => {
    const newStock = parseInt(stockInputValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Stock must be a valid non-negative number');
      return;
    }
    try {
      await updateStock({ id, stock: newStock }).unwrap();
      toast.success(`Stock updated to ${newStock}`);
      setEditingStockId(null);
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Permanently delete "${name}" from inventory?`)) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted');
      } catch {
        toast.error('Deletion failed');
      }
    }
  };

  return (
    <div className="animate-fadeIn font-dm relative">
      {/* 1. FIXED PAGE HEADER & TOOLBAR */}
      <div className="sticky top-0 z-30 bg-[#F7F5F0] pb-4 pt-4 px-6 border-b border-fm-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-playfair text-fm-text text-[32px] font-bold tracking-tight">Products Inventory</h1>
            <p className="text-fm-text-3 tracking-[0.2em] text-[10px] uppercase font-bold">Catalogue Management • {data?.data?.total || 0} items</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl justify-end">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, category or slug..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-white border border-fm-border px-10 py-3 text-[13px] font-dm text-fm-text placeholder-fm-text-3 outline-none focus:border-fm-gold transition-all shadow-sm"
              />
              <svg className="w-4 h-4 text-fm-text-3 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <Link
              to="/admin/products/add"
              className="bg-[#1A1714] text-[#B8860B] px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#B8860B] hover:text-[#1A1714] transition-all text-center whitespace-nowrap"
            >
              ADD NEW MASTERPIECE
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="bg-white border border-fm-border shadow-sm flex flex-col min-h-[500px]">

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="p-20 text-center text-fm-text-3 font-dm skeleton-shimmer text-[15px]">Syncing inventory...</div>
          ) : products.length === 0 ? (
            <div className="p-32 text-center">
              <div className="text-6xl mb-6 opacity-20">👞</div>
              <h3 className="text-fm-text font-playfair text-[26px] mb-2 font-bold">No items match your search</h3>
              <p className="text-fm-text-3 text-[13px] tracking-widest uppercase font-medium">Try different keywords or clear search.</p>
            </div>
          ) : (
            <table className="w-full text-left text-[14px] whitespace-nowrap border-separate border-spacing-0">
              <thead className="bg-[#FAFAF8] text-fm-text-3 uppercase tracking-[0.2em] text-[10px] font-bold border-b border-fm-border sticky top-[80px] z-20 shadow-xs">
                <tr>
                  <th className="px-4 py-5 w-10 text-center text-fm-gold">#</th>
                  <th className="px-4 py-5">Product Details</th>
                  <th className="px-4 py-5">Unit Price</th>
                  <th className="px-4 py-5">Inventory</th>
                  <th className="px-4 py-5">Visibility</th>
                  <th className="px-4 py-5">Featured</th>
                  <th className="px-4 py-5">Discontinued</th>
                  <th className="px-4 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fm-border">
                {products.map((product, index) => (
                  <tr key={product._id} className={`hover:bg-fm-surface-2 transition-colors group ${product.isDiscontinued ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                    <td className="px-4 py-6 text-center text-fm-text-3 font-bold text-[11px]">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#F5F3EE] p-1 border border-fm-border group-hover:border-fm-gold/50 transition-colors">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold uppercase text-fm-text-3">NO IMAGE</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-fm-text font-bold text-[14px] uppercase tracking-wide truncate w-64" title={product.name}>{product.name}</p>
                          <p className="text-fm-gold text-[10px] uppercase tracking-[0.2em] font-bold">{product.category.replace(/-/g, ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-fm-text font-bold font-playfair text-[18px]">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex flex-col gap-1">
                        {editingStockId === product._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={stockInputValue}
                              onChange={(e) => setStockInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStockSave(product._id);
                                if (e.key === 'Escape') setEditingStockId(null);
                              }}
                              autoFocus
                              className="w-20 border border-fm-gold px-2 py-1 text-[12px] text-fm-text font-bold outline-none"
                            />
                            <button
                              onClick={() => handleStockSave(product._id)}
                              className="text-[10px] bg-[#1A1714] text-white px-2 py-1 font-bold"
                            >✓</button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="text-[10px] border border-fm-border px-2 py-1 text-fm-text-3 font-bold"
                            >✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStockEdit(product._id, product.stock)}
                            title="Click to edit stock"
                            className="text-left group/stock"
                          >
                            <span className={`text-[11px] font-bold uppercase tracking-wider underline-offset-2 group-hover/stock:underline ${
                              product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {product.stock} Units
                            </span>
                            <span className="block text-[9px] text-fm-text-3 mt-0.5">click to edit</span>
                          </button>
                        )}
                        <div className="w-24 h-1 bg-fm-border rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${Math.min(product.stock, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <button onClick={() => handleToggle(product._id, 'visibility')} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${product.isVisible ? 'bg-fm-text' : 'bg-fm-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${product.isVisible ? 'left-[26px]' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-6">
                      <button onClick={() => handleToggle(product._id, 'featured')} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${product.isFeatured ? 'bg-fm-gold' : 'bg-fm-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${product.isFeatured ? 'left-[26px]' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-6">
                      <button onClick={() => handleToggle(product._id, 'discontinued')} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${product.isDiscontinued ? 'bg-fm-error' : 'bg-fm-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${product.isDiscontinued ? 'left-[26px]' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/products/edit/${product._id}`} className="bg-white p-2.5 border border-fm-border hover:border-fm-gold hover:text-fm-gold transition-all shadow-sm" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(product._id, product.name)} className="bg-white p-2.5 border border-fm-border hover:border-fm-error hover:text-fm-error transition-all shadow-sm" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 2. ADVANCED PAGINATION FOOTER */}
        <div className="p-4 border-t border-fm-border flex flex-col md:flex-row justify-between items-center gap-6 bg-[#FAFAF8]">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-[11px] text-fm-text-3 font-black uppercase tracking-[0.2em]">
              Showing Page {Math.max(0, page - 1)} of {Math.max(0, totalPages - 1)}
            </span>
            
            <div className="flex items-center gap-3 border-l border-fm-border pl-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-fm-text-3">Rows:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="bg-white border border-fm-border text-[11px] font-black px-3 py-1 outline-none focus:border-fm-gold transition-colors cursor-pointer"
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
              className="w-12 h-12 flex items-center justify-center border border-fm-border bg-white text-fm-text hover:bg-[#1A1714] hover:text-white disabled:opacity-20 transition-all font-bold"
            >
              &larr;
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-12 h-12 flex items-center justify-center border border-fm-border bg-white text-fm-text hover:bg-[#1A1714] hover:text-white disabled:opacity-20 transition-all font-bold"
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

export default AdminProducts;
