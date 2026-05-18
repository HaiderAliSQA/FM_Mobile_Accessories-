// backend/src/routes/adminDashboard.ts
import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// GET /api/admin/dashboard - Get wholesale dashboard metrics and overdue order lists
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Core KPIs (Excluding cancelled orders from financial sums)
    const activeOrdersQuery = { orderStatus: { $ne: 'cancelled' } };

    const [
      totalOrders,
      financials,
      unpaidOrdersCount,
      partialOrdersCount,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.aggregate([
        { $match: activeOrdersQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalCollected: { $sum: '$totalPaid' },
            totalDue: { $sum: '$totalDue' },
          },
        },
      ]),
      Order.countDocuments({ paymentStatus: 'unpaid', orderStatus: { $ne: 'cancelled' } }),
      Order.countDocuments({ paymentStatus: 'partial', orderStatus: { $ne: 'cancelled' } }),
      Order.find({}).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const stats = financials[0] || { totalRevenue: 0, totalCollected: 0, totalDue: 0 };

    // 2. Overdue orders (Created > 7 days ago, with remaining due balance, not cancelled)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const overdueOrders = await Order.find({
      createdAt: { $lt: sevenDaysAgo },
      totalDue: { $gt: 0 },
      orderStatus: { $ne: 'cancelled' },
    })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: stats.totalRevenue,
        totalCollected: stats.totalCollected,
        totalDue: stats.totalDue,
        unpaidOrders: unpaidOrdersCount,
        partialOrders: partialOrdersCount,
        recentOrders,
        overdueOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wholesale dashboard stats',
      error: (error as Error).message,
    });
  }
});

export default router;
