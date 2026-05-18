// backend/src/routes/wholesalePayments.ts
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import WholesalePayment from '../models/WholesalePayment';
import WholesaleOrder from '../models/WholesaleOrder';
import ShopKeeper from '../models/ShopKeeper';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// POST /api/admin/wholesale-payments — Record a payment (Business Rules 1–4)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId, shopKeeperId, amount, method, transactionId, paymentDate, installmentNote } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      await session.abortTransaction(); session.endSession();
      res.status(400).json({ success: false, message: 'Valid order ID is required' }); return;
    }
    if (!shopKeeperId || !mongoose.Types.ObjectId.isValid(shopKeeperId)) {
      await session.abortTransaction(); session.endSession();
      res.status(400).json({ success: false, message: 'Valid shop keeper ID is required' }); return;
    }

    const validMethods = ['cash', 'jazzcash', 'easypaisa', 'bank_transfer', 'cheque'];
    if (!method || !validMethods.includes(method)) {
      await session.abortTransaction(); session.endSession();
      res.status(400).json({ success: false, message: `Invalid method. Must be one of: ${validMethods.join(', ')}` }); return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      await session.abortTransaction(); session.endSession();
      res.status(400).json({ success: false, message: 'Amount must be greater than 0' }); return;
    }

    // Fetch order
    const order = await WholesaleOrder.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction(); session.endSession();
      res.status(404).json({ success: false, message: 'Order not found' }); return;
    }

    if (order.paymentStatus === 'paid') {
      await session.abortTransaction(); session.endSession();
      res.status(400).json({ success: false, message: 'Order is already fully paid' }); return;
    }

    // Business Rule 1: Payment cannot exceed remaining due
    if (parsedAmount > order.totalDue) {
      await session.abortTransaction(); session.endSession();
      res.status(400).json({
        success: false,
        message: `Payment PKR ${parsedAmount.toLocaleString()} exceeds remaining due PKR ${order.totalDue.toLocaleString()}`,
      }); return;
    }

    // Snapshot before update
    const paidBeforeThis = order.totalPaid;
    const orderTotalAtTime = order.totalAmount;
    const dueAfterThis = order.totalDue - parsedAmount;

    // Create payment record
    const payment = new WholesalePayment({
      order: orderId,
      shopKeeper: shopKeeperId,
      amount: parsedAmount,
      method,
      transactionId: transactionId?.trim() || undefined,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      installmentNote: installmentNote?.trim() || undefined,
      orderTotalAtTime,
      paidBeforeThis,
      dueAfterThis,
    });
    await payment.save({ session });

    // Update Order totals (pre-save hook handles paymentStatus + totalDue)
    order.totalPaid += parsedAmount;
    await order.save({ session });

    // Update ShopKeeper running totals (Business Rule 3)
    await ShopKeeper.findByIdAndUpdate(shopKeeperId, {
      $inc: { totalPaid: parsedAmount, totalDue: -parsedAmount },
    }, { session });

    await session.commitTransaction();
    session.endSession();

    // Return updated order with new payment list
    const updatedOrder = await WholesaleOrder.findById(orderId)
      .populate('shopKeeper', 'name shopName phone city totalDue totalPaid totalOrdered')
      .lean();

    res.status(201).json({
      success: true,
      data: { payment, order: updatedOrder },
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: 'Failed to record payment', error: (error as Error).message });
  }
});

// GET /api/admin/wholesale-payments — All payments with filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', orderId, shopKeeperId, from, to, method } = req.query as Record<string, string | undefined>;

    const query: Record<string, unknown> = {};
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) query['order'] = orderId;
    if (shopKeeperId && mongoose.Types.ObjectId.isValid(shopKeeperId)) query['shopKeeper'] = shopKeeperId;
    if (method) query['method'] = method;
    if (from || to) {
      const dateQuery: Record<string, Date> = {};
      if (from) dateQuery['$gte'] = new Date(from + 'T00:00:00.000Z');
      if (to) dateQuery['$lte'] = new Date(to + 'T23:59:59.999Z');
      query['paymentDate'] = dateQuery;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      WholesalePayment.find(query)
        .populate('shopKeeper', 'name shopName phone city')
        .populate('order', 'orderId totalAmount')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      WholesalePayment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { payments, total, pages: Math.ceil(total / limitNum), currentPage: pageNum, limit: limitNum },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: (error as Error).message });
  }
});

// GET /api/admin/wholesale-payments/:id — Single payment
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ success: false, message: 'Invalid ID' }); return; }

    const payment = await WholesalePayment.findById(id)
      .populate('shopKeeper', 'name shopName phone city')
      .populate('order', 'orderId totalAmount totalPaid totalDue paymentStatus')
      .lean();

    if (!payment) { res.status(404).json({ success: false, message: 'Payment not found' }); return; }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed', error: (error as Error).message });
  }
});

// DELETE /api/admin/wholesale-payments/:id — Reverse a payment (Business Rule 5)
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction(); session.endSession();
      res.status(400).json({ success: false, message: 'Invalid ID' }); return;
    }

    const payment = await WholesalePayment.findById(id).session(session);
    if (!payment) {
      await session.abortTransaction(); session.endSession();
      res.status(404).json({ success: false, message: 'Payment not found' }); return;
    }

    const { amount, order: orderId, shopKeeper: shopKeeperId } = payment;

    // Reverse on Order
    const order = await WholesaleOrder.findById(orderId).session(session);
    if (order) {
      order.totalPaid = Math.max(0, order.totalPaid - amount);
      await order.save({ session }); // pre-save hook recalculates totalDue + paymentStatus
    }

    // Reverse on ShopKeeper
    await ShopKeeper.findByIdAndUpdate(shopKeeperId, {
      $inc: { totalPaid: -amount, totalDue: amount },
    }, { session });

    // Delete the payment record
    await WholesalePayment.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: `Payment of PKR ${amount.toLocaleString()} reversed successfully` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: 'Failed to reverse payment', error: (error as Error).message });
  }
});

export default router;
