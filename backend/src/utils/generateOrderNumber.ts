// backend/src/utils/generateOrderNumber.ts
import Order from '../models/Order';

const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `FH-${year}-`;

  // Find the last order for this year to get the highest sequence
  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${prefix}` },
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  let nextSequence = 1;

  if (lastOrder && lastOrder.orderNumber) {
    const parts = lastOrder.orderNumber.split('-');
    const lastSequence = parseInt(parts[2] ?? '0', 10);
    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
};

export default generateOrderNumber;
