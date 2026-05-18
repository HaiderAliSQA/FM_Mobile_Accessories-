// backend/src/routes/adminPayments.ts
import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import Payment, { PaymentMethod } from '../models/Payment';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// POST /api/admin/payments - Record a new payment against a wholesale order
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      amount,
      method,
      transactionId,
      paymentDate,
      installmentNote,
    } = req.body as {
      orderId: string;
      amount: number;
      method: PaymentMethod;
      transactionId?: string;
      paymentDate?: string;
      installmentNote?: string;
    };

    if (!orderId || !amount || amount <= 0 || !method) {
      res.status(400).json({ success: false, message: 'OrderId, positive amount, and payment method are required' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Assert payment does not exceed the remaining due
    if (amount > order.totalDue) {
      res.status(400).json({
        success: false,
        message: `Payment amount (PKR ${amount}) exceeds the remaining due of PKR ${order.totalDue}`,
      });
      return;
    }

    const paidBeforeThis = order.totalPaid;
    const dueAfterThis = Math.max(0, order.totalDue - amount);

    const payment = new Payment({
      order: order._id,
      shopName: order.shopName,
      phone: order.phone,
      amount,
      method,
      transactionId: transactionId?.trim() || undefined,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      installmentNote: installmentNote?.trim() || undefined,
      orderTotalAtTime: order.totalAmount,
      paidBeforeThis,
      dueAfterThis,
    });

    await payment.save();

    // Increment order totalPaid and save to trigger pre-save hook (which updates totalDue and status)
    order.totalPaid += amount;
    await order.save();

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Wholesale payment recorded successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record wholesale payment',
      error: (error as Error).message,
    });
  }
});

// GET /api/admin/payments - List payments with filters
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, phone, limit = '50' } = req.query as Record<string, string | undefined>;

    const query: Record<string, unknown> = {};

    if (orderId) {
      query['order'] = orderId;
    }

    if (phone) {
      query['phone'] = phone;
    }

    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    const payments = await Payment.find(query)
      .sort({ paymentDate: -1 })
      .limit(limitNum)
      .populate('order', 'orderId shopName')
      .lean();

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment ledger entries',
      error: (error as Error).message,
    });
  }
});

// DELETE /api/admin/payments/:id - Reverse/Delete a payment ledger entry
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    const order = await Order.findById(payment.order);
    if (order) {
      // Revert/subtract the paid amount from order totalPaid
      order.totalPaid = Math.max(0, order.totalPaid - payment.amount);
      await order.save(); // pre-save hook will update totalDue and paymentStatus automatically!
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment reversed successfully, order balance recalculated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reverse payment record',
      error: (error as Error).message,
    });
  }
});

export default router;
