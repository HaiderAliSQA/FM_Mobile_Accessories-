// frontend/src/components/ui/ProductSkeleton.tsx
import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden flex flex-col border border-fm-border/30">
      {/* Premium shimmer skeleton matching product card shape */}
      <div className="skeleton-shimmer aspect-square w-full" />
      
      <div className="py-4 px-1 flex flex-col gap-2">
        {/* Category */}
        <div className="skeleton-shimmer h-[10px] w-1/4 rounded-sm" />
        
        {/* Title */}
        <div className="skeleton-shimmer h-[14px] w-3/4 rounded-sm mt-1" />
        
        {/* Price Row */}
        <div className="flex items-center gap-2 mt-1">
          <div className="skeleton-shimmer h-[16px] w-[60px] rounded-sm" />
          <div className="skeleton-shimmer h-[12px] w-[40px] rounded-sm" />
        </div>
        
        {/* Star row */}
        <div className="skeleton-shimmer h-[10px] w-[80px] rounded-sm mt-1" />
      </div>
    </div>
  );
};

export default ProductSkeleton;
