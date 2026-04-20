// frontend/src/components/SearchBar.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Chargers', value: 'chargers' },
  { label: 'Hands Free', value: 'hands-free' },
  { label: 'Data Cables', value: 'data-cables' },
  { label: 'Mobile Covers', value: 'mobile-covers' },
  { label: 'Memory Cards', value: 'memory-cards' },
  { label: 'Power Banks', value: 'power-banks' },
  { label: 'Glass Protectors', value: 'glass-protectors' },
  { label: 'Selfie Sticks', value: 'selfie-sticks' },
  { label: 'Bluetooth', value: 'bluetooth' },
  { label: 'Other Accessories', value: 'other-accessories' },
];

export const SearchBar: React.FC = () => {
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (query.trim()) params.set('q', query.trim());
    
    if (category && !query.trim()) {
      navigate(`/category/${category}`);
    } else if (params.toString()) {
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center bg-[#f8f5f0] border border-fm-border rounded-full px-2 py-1 ml-4 w-full max-w-md shadow-sm">
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        className="bg-transparent border-none outline-none font-dm text-[11px] font-bold text-fm-text px-3 py-1 cursor-pointer min-w-[120px] uppercase tracking-wider"
      >
        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      
      <div className="w-[1px] h-4 bg-fm-border mx-1" />
      
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-1 bg-transparent border-none outline-none px-4 py-1 font-dm text-[13px] text-fm-text placeholder-fm-text-3"
      />
      
      <button 
        onClick={handleSearch}
        className="w-8 h-8 flex items-center justify-center bg-fm-gold text-white rounded-full transition-transform hover:scale-110 active:scale-95 ml-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
