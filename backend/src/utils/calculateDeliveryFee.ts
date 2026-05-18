// backend/src/utils/calculateDeliveryFee.ts

export interface ICartItem {
  quantity: number;
}

/**
 * Calculates the wholesale delivery fee.
 * PKR 200 if the total quantity of all items in the cart is exactly 1.
 * FREE (PKR 0) if the total quantity is greater than 1.
 */
export const calculateDeliveryFee = (items: ICartItem[]): number => {
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  return totalQuantity === 1 ? 200 : 0;
};

export default calculateDeliveryFee;
