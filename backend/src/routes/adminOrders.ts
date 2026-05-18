// backend/src/routes/adminOrders.ts
import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import Payment from '../models/Payment';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// GET /api/admin/orders - Get orders list with pagination & filters
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      orderStatus,
      paymentStatus,
      search,
      dateFrom,
      dateTo,
    } = req.query as Record<string, string | undefined>;

    const query: Record<string, unknown> = {};

    if (dateFrom) {
      query['createdAt'] = {
        ...((query['createdAt'] as object) || {}),
        $gte: new Date(dateFrom + 'T00:00:00.000Z'),
      };
    }
    if (dateTo) {
      query['createdAt'] = {
        ...((query['createdAt'] as object) || {}),
        $lte: new Date(dateTo + 'T23:59:59.999Z'),
      };
    }

    if (orderStatus && orderStatus !== 'all') {
      query['orderStatus'] = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query['paymentStatus'] = paymentStatus;
    }

    if (search) {
      query['$or'] = [
        { orderId: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin orders',
      error: (error as Error).message,
    });
  }
});

// GET /api/admin/orders/:id - Get a single order + its entire transaction/payment history
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name slug images category')
      .lean();

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Fetch payment ledger history associated with this order
    const payments = await Payment.find({ order: req.params.id })
      .sort({ paymentDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...order,
        payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: (error as Error).message,
    });
  }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put('/:id/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderStatus } = req.body as { orderStatus: string };

    const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      res.status(400).json({ success: false, message: 'Invalid order status value' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { orderStatus } },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: (error as Error).message,
    });
  }
});

// PUT /api/admin/orders/:id/note - Update admin internal note
router.put('/:id/note', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminNote } = req.body as { adminNote: string };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { adminNote: adminNote?.trim() || '' } },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Internal admin note updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update admin note',
      error: (error as Error).message,
    });
  }
});

export default router;
