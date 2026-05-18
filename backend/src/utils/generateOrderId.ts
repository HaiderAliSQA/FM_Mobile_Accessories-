// backend/src/utils/generateOrderId.ts
import Order from '../models/Order';

/**
 * Generates a unique order ID for B2B wholesale orders.
 * Format: FH-YYYYMMDD-XXX (e.g., FH-20260518-001)
 */
export const generateOrderId = async (): Promise<string> => {
  const today = new Date();
  
  // Format as YYYYMMDD in local timezone
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${date}`;

  const prefix = `FH-${dateStr}-`;

  // Define start and end of the day in local time
  const todayStart = new Date(year, today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(year, today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Count documents created today
  const count = await Order.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  const sequence = String(count + 1).padStart(3, '0');
  return `${prefix}${sequence}`;
};

export default generateOrderId;
