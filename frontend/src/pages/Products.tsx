// frontend/src/pages/Products.tsx
import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productsApi';
import ProductCard from '../components/ui/ProductCard';
import ProductSkeleton from '../components/ui/ProductSkeleton';
import { useScrollReveal } from '../hooks/useScrollReveal';

const SIDEBAR_CATEGORIES = [
  { value: '',                  label: 'All Products' },
  { value: 'chargers',          label: 'Chargers' },
  { value: 'hands-free',        label: 'Hands Free' },
  { value: 'mobile-covers',     label: 'Mobile Covers' },
  { value: 'data-cables',       label: 'Data Cables' },
  { value: 'power-banks',       label: 'Power Banks' },
  { value: 'glass-protectors',  label: 'Glass Protectors' },
];

const SORTS = [
  { label: 'Newest Arrivals', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
];

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = searchParams.get('q') || '';

  const { data, isLoading } = useGetProductsQuery({
    category,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sortBy: sort,
    search: q || undefined,
    page,
    limit: 12,
  });

  const products = data?.data?.products || [];
  const revealRef = useScrollReveal(0.1);
  const totalPages = data?.data?.pages || 1;
  const totalItems = data?.data?.total || 0;

  const updateParam = useCallback((key: string, value: string) => {
    setSearchParams(params => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== 'page') params.set('page', '1');
      return params;
    });
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const FiltersContent = () => (
    <div className="space-y-10">
      {/* Category */}
      <div>
        <h3 className="font-heading text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-6 font-extrabold">Categories</h3>
        <div className="space-y-4">
          {SIDEBAR_CATEGORIES.map(c => (
            <label key={c.value} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="radio" 
                  name="category" 
                  value={c.value} 
                  checked={category === c.value}
                  onChange={() => updateParam('category', c.value)}
                  className="peer appearance-none w-5 h-5 border-2 border-white/10 rounded-full checked:border-electric transition-all cursor-pointer"
                />
                <div className="absolute w-2.5 h-2.5 bg-electric rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className={`font-body text-sm transition-colors ${category === c.value ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-heading text-[10px] tracking-[0.3em] uppercase text-gray-500 mb-6 font-extrabold">Price (PKR)</h3>
        <div className="grid grid-cols-2 gap-3">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="w-full bg-navy-dark border border-white/5 rounded-xl text-white font-body px-4 py-3 text-xs placeholder-gray-600 focus:outline-none focus:border-electric transition-colors"
          />
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="w-full bg-navy-dark border border-white/5 rounded-xl text-white font-body px-4 py-3 text-xs placeholder-gray-600 focus:outline-none focus:border-electric transition-colors"
          />
        </div>
      </div>

      <button 
        onClick={clearFilters}
        className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-dark pt-20" ref={revealRef}>
      
      {/* Mobile Filter Trigger */}
      <div className="lg:hidden sticky top-20 z-40 bg-navy-mid/80 backdrop-blur-md px-4 py-3 border-b border-white/5 flex justify-between items-center transition-all">
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 font-heading text-[10px] tracking-widest uppercase text-white font-extrabold px-5 py-2.5 rounded-full bg-electric shadow-glow-blue"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4h18M3 12h18M3 20h18" /></svg>
          Filters
        </button>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{totalItems} Results</span>
      </div>

      {/* Mobile Side Drawer (Modern) */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-navy-dark/90 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute top-0 right-0 w-[85%] h-full bg-navy-mid border-l border-white/5 p-8 shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-heading text-xl font-extrabold text-white">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <FiltersContent />
            <button 
              onClick={() => setIsMobileFiltersOpen(false)} 
              className="mt-12 w-full btn-electric py-4 rounded-xl font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="flex max-w-screen-2xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-white/5 min-h-[calc(100vh-80px)] p-10">
          <div className="sticky top-32">
            <h2 className="font-heading text-xs tracking-[0.4em] uppercase text-gray-600 font-extrabold mb-10">Navigation</h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1 p-6 md:p-10 lg:p-12">
          {q && (
            <div className="mb-10 animate-fade-in">
              <h1 className="text-gray-400 text-sm uppercase tracking-widest font-bold">Search results for:</h1>
              <p className="text-white text-3xl font-extrabold mt-2">"{q}"</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-extrabold text-white uppercase tracking-tight">
                {category ? category.replace('-', ' ') : 'All Collection'}
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Showing {totalItems} items across Pakistan
              </p>
            </div>

            <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort:</span>
               <select 
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-navy-mid border border-white/5 text-white text-xs font-bold rounded-xl px-5 py-3 focus:outline-none focus:border-electric transition-all"
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>
          ) : (
            <div className="py-32 text-center bg-navy-mid/20 rounded-[3rem] border border-white/5 border-dashed">
              <span className="text-4xl mb-6 block">⚡</span>
              <h3 className="font-heading text-2xl font-extrabold text-white mb-2">No items found</h3>
              <p className="text-gray-500 text-sm mb-8">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="btn-electric px-10 py-4 font-bold rounded-2xl">
                Reset Collection
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-20">
              <button
                onClick={() => updateParam('page', Math.max(1, page - 1).toString())}
                disabled={page === 1}
                className="w-12 h-12 bg-navy-mid rounded-xl flex items-center justify-center text-white disabled:opacity-30 border border-white/5 hover:border-electric transition-colors"
              >
                ←
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => updateParam('page', (i + 1).toString())}
                  className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${page === i + 1 ? 'bg-electric text-white shadow-glow-blue' : 'bg-navy-mid text-gray-400 border border-white/5 hover:border-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => updateParam('page', Math.min(totalPages, page + 1).toString())}
                disabled={page === totalPages}
                className="w-12 h-12 bg-navy-mid rounded-xl flex items-center justify-center text-white disabled:opacity-30 border border-white/5 hover:border-electric transition-colors"
              >
                →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
