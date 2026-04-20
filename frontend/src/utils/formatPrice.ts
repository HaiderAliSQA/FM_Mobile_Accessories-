/**
 * Safely formats a price value as PKR currency string.
 * Handles string/number/undefined/NaN safely.
 */
export const formatPrice = (price: number | string | undefined | null): string => {
  if (price === null || price === undefined || price === '') return 'PKR 0';
  const num = Number(price);
  if (isNaN(num) || !isFinite(num)) return 'PKR 0';
  // Cap at a reasonable max (PKR 9,999,999) to catch calculation bugs
  const capped = Math.min(Math.abs(Math.round(num)), 9999999);
  return `PKR ${capped.toLocaleString('en-PK')}`;
};

/**
 * Calculates discount percentage safely.
 */
export const discountPercent = (
  price: number | string,
  compareAtPrice: number | string
): number => {
  const p = Number(price);
  const c = Number(compareAtPrice);
  if (!p || !c || c <= p) return 0;
  return Math.round((1 - p / c) * 100);
};

/**
 * Formats cart total with delivery.
 */
export const cartSummary = (subtotal: number) => {
  const delivery = subtotal >= 5000 ? 0 : 300;
  return {
    subtotal: Math.round(subtotal),
    delivery,
    total: Math.round(subtotal) + delivery,
    freeDelivery: subtotal >= 5000,
  };
};
