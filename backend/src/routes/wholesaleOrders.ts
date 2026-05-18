// backend/src/routes/wholesaleOrders.ts
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import WholesaleOrder from '../models/WholesaleOrder';
import ShopKeeper from '../models/ShopKeeper';
import WholesalePayment from '../models/WholesalePayment';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// Generate order ID: FH-YYYYMMDD-NNN
async function generateWholesaleOrderId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `FH-${dateStr}-`;
  const count = await WholesaleOrder.countDocuments({ orderId: { $regex: `^${prefix}` } });
  const seq = String(count + 1).padStart(3, '0');
  return `${prefix}${seq}`;
}

// POST /api/admin/wholesale-orders — Create new wholesale order
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopKeeperId, items, deliveryFee = 0, discount = 0, paymentSchedule = 'weekly', expectedPaymentDate, adminNotes } = req.body;

    if (!shopKeeperId || !mongoose.Types.ObjectId.isValid(shopKeeperId)) {
      res.status(400).json({ success: false, message: 'Valid shop keeper ID is required' }); return;
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'At least one item is required' }); return;
    }

    const shopKeeper = await ShopKeeper.findById(shopKeeperId);
    if (!shopKeeper) { res.status(404).json({ success: false, message: 'Shop keeper not found' }); return; }
    if (!shopKeeper.isActive) { res.status(400).json({ success: false, message: 'Shop keeper account is inactive' }); return; }

    // Build items with subtotals
    const resolvedItems = items.map((item: { name: string; brand?: string; image?: string; price: number; quantity: number; productId?: string }) => ({
      productId: item.productId ? new mongoose.Types.ObjectId(item.productId) : undefined,
      name: String(item.name).trim(),
      brand: item.brand?.trim() || undefined,
      image: item.image || undefined,
      price: Number(item.price),
      quantity: Number(item.quantity),
      subtotal: Number(item.price) * Number(item.quantity),
    }));

    const subtotal = resolvedItems.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0);
    const totalAmount = subtotal + Number(deliveryFee) - Number(discount);

    if (totalAmount <= 0) { res.status(400).json({ success: false, message: 'Total amount must be greater than 0' }); return; }

    // Credit limit warning (soft — admin can still proceed)
    const newTotalDue = shopKeeper.totalDue + totalAmount;
    const creditLimitWarning = newTotalDue > shopKeeper.creditLimit
      ? `This order will exceed credit limit by PKR ${(newTotalDue - shopKeeper.creditLimit).toLocaleString()}`
      : null;

    const orderId = await generateWholesaleOrderId();

    const order = new WholesaleOrder({
      orderId,
      shopKeeper: shopKeeperId,
      items: resolvedItems,
      subtotal,
      deliveryFee: Number(deliveryFee),
      discount: Number(discount),
      totalAmount,
      totalPaid: 0,
      paymentSchedule,
      expectedPaymentDate: expectedPaymentDate ? new Date(expectedPaymentDate) : undefined,
      adminNotes: adminNotes?.trim() || undefined,
    });

    await order.save();

    // Update ShopKeeper running totals
    await ShopKeeper.findByIdAndUpdate(shopKeeperId, {
      $inc: { totalOrdered: totalAmount, totalDue: totalAmount },
    });

    const populated = await WholesaleOrder.findById(order._id).populate('shopKeeper', 'name shopName phone city creditLimit totalDue').lean();

    res.status(201).json({
      success: true,
      data: populated,
      creditLimitWarning,
      message: 'Wholesale order created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create order', error: (error as Error).message });
  }
});

// GET /api/admin/wholesale-orders — List with filters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', paymentStatus, orderStatus, shopKeeper, search, dateFrom, dateTo } = req.query as Record<string, string | undefined>;

    const query: Record<string, unknown> = {};
    if (paymentStatus && paymentStatus !== 'all') query['paymentStatus'] = paymentStatus;
    if (orderStatus && orderStatus !== 'all') query['orderStatus'] = orderStatus;
    if (shopKeeper && mongoose.Types.ObjectId.isValid(shopKeeper)) query['shopKeeper'] = shopKeeper;
    if (dateFrom) query['createdAt'] = { ...((query['createdAt'] as object) || {}), $gte: new Date(dateFrom + 'T00:00:00.000Z') };
    if (dateTo) query['createdAt'] = { ...((query['createdAt'] as object) || {}), $lte: new Date(dateTo + 'T23:59:59.999Z') };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // If searching by shop name/phone/city, do a lookup
    let orders: unknown[];
    let total: number;

    if (search) {
      // Use aggregation for search across shopKeeper fields
      const basePipeline: mongoose.PipelineStage[] = [
        {
          $lookup: {
            from: 'shopkeepers',
            localField: 'shopKeeper',
            foreignField: '_id',
            as: 'shopKeeperData',
          },
        },
        { $unwind: '$shopKeeperData' as string },
        {
          $match: {
            ...query,
            $or: [
              { 'shopKeeperData.shopName': { $regex: search, $options: 'i' } },
              { 'shopKeeperData.name': { $regex: search, $options: 'i' } },
              { 'shopKeeperData.phone': { $regex: search, $options: 'i' } },
              { 'shopKeeperData.city': { $regex: search, $options: 'i' } },
              { orderId: { $regex: search, $options: 'i' } },
            ],
          },
        },
        { $sort: { createdAt: -1 as const } },
      ];

      const countPipeline: mongoose.PipelineStage[] = [...basePipeline, { $count: 'total' }];
      const dataPipeline: mongoose.PipelineStage[] = [...basePipeline, { $skip: skip }, { $limit: limitNum }];

      const [countResult, dataResult] = await Promise.all([
        WholesaleOrder.aggregate(countPipeline),
        WholesaleOrder.aggregate(dataPipeline),
      ]);

      total = countResult[0]?.total || 0;
      orders = dataResult.map((o: Record<string, unknown>) => ({ ...o, shopKeeper: o['shopKeeperData'] }));

    } else {
      [orders, total] = await Promise.all([
        WholesaleOrder.find(query)
          .populate('shopKeeper', 'name shopName phone city creditLimit totalDue')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        WholesaleOrder.countDocuments(query),
      ]);
    }

    // Summary stats
    const statsAgg = await WholesaleOrder.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$totalPaid' },
          totalDue: { $sum: '$totalDue' },
          unpaidCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] } },
          partialCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] } },
        },
      },
    ]);
    const stats = statsAgg[0] || { totalValue: 0, totalCollected: 0, totalDue: 0, unpaidCount: 0, partialCount: 0 };

    res.json({
      success: true,
      data: { orders, total, pages: Math.ceil(total / limitNum), currentPage: pageNum, limit: limitNum, stats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: (error as Error).message });
  }
});

// GET /api/admin/wholesale-orders/stats — Dashboard summary
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [orderStats, skCount, recentPayments] = await Promise.all([
      WholesaleOrder.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalValue: { $sum: '$totalAmount' },
            totalCollected: { $sum: '$totalPaid' },
            totalDue: { $sum: '$totalDue' },
            unpaidCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] } },
            partialCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] } },
          },
        },
      ]),
      ShopKeeper.countDocuments({ isActive: true }),
      WholesalePayment.find().sort({ paymentDate: -1 }).limit(10)
        .populate('shopKeeper', 'shopName name')
        .populate('order', 'orderId')
        .lean(),
    ]);

    // Overdue orders (unpaid/partial past expectedPaymentDate)
    const now = new Date();
    const overdueOrders = await WholesaleOrder.find({
      paymentStatus: { $in: ['unpaid', 'partial'] },
      expectedPaymentDate: { $lt: now },
    })
      .populate('shopKeeper', 'name shopName phone city')
      .sort({ totalDue: -1 })
      .limit(10)
      .lean();

    const stats = orderStats[0] || { totalOrders: 0, totalValue: 0, totalCollected: 0, totalDue: 0, unpaidCount: 0, partialCount: 0 };

    res.json({
      success: true,
      data: {
        ...stats,
        activeShopKeepers: skCount,
        overdueOrders,
        recentPayments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: (error as Error).message });
  }
});

// GET /api/admin/wholesale-orders/:id — Single order with payments
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ success: false, message: 'Invalid ID' }); return; }

    const [order, payments] = await Promise.all([
      WholesaleOrder.findById(id).populate('shopKeeper', 'name shopName phone whatsapp city address creditLimit totalDue totalOrdered totalPaid').lean(),
      WholesalePayment.find({ order: id }).sort({ paymentDate: 1 }).lean(),
    ]);

    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }

    res.json({ success: true, data: { order, payments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: (error as Error).message });
  }
});

// PUT /api/admin/wholesale-orders/:id/status — Update order status or notes
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ success: false, message: 'Invalid ID' }); return; }

    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    const { orderStatus, adminNotes, expectedPaymentDate, paymentSchedule } = req.body;

    if (orderStatus && !validStatuses.includes(orderStatus)) {
      res.status(400).json({ success: false, message: 'Invalid order status' }); return;
    }

    const updateData: Record<string, unknown> = {};
    if (orderStatus) updateData['orderStatus'] = orderStatus;
    if (adminNotes !== undefined) updateData['adminNotes'] = adminNotes?.trim() || undefined;
    if (expectedPaymentDate !== undefined) updateData['expectedPaymentDate'] = expectedPaymentDate ? new Date(expectedPaymentDate) : undefined;
    if (paymentSchedule !== undefined) updateData['paymentSchedule'] = paymentSchedule;

    // Business Rule 6: if cancelling and there are payments, warn
    if (orderStatus === 'cancelled') {
      const order = await WholesaleOrder.findById(id);
      if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
      if (order.totalPaid > 0 && !req.body.forceCancel) {
        res.status(400).json({
          success: false,
          message: `PKR ${order.totalPaid.toLocaleString()} has been received. Send { forceCancel: true } to proceed.`,
          requiresConfirmation: true,
        });
        return;
      }
      // Adjust ShopKeeper totalDue by removing remaining due
      if (order.totalDue > 0) {
        await ShopKeeper.findByIdAndUpdate(order.shopKeeper, {
          $inc: { totalDue: -order.totalDue, totalOrdered: -order.totalDue },
        });
      }
    }

    const order = await WholesaleOrder.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }

    res.json({ success: true, data: order, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update', error: (error as Error).message });
  }
});

export default router;
