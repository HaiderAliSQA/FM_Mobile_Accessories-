// backend/src/routes/shopKeepers.ts
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import ShopKeeper from '../models/ShopKeeper';
import WholesaleOrder from '../models/WholesaleOrder';
import WholesalePayment from '../models/WholesalePayment';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/shopkeepers
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, city, isActive } = req.query as Record<string, string | undefined>;
    const query: Record<string, unknown> = {};
    if (search) {
      query['$or'] = [
        { shopName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (city) query['city'] = { $regex: city, $options: 'i' };
    if (isActive !== undefined) query['isActive'] = isActive === 'true';

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [shopKeepers, total] = await Promise.all([
      ShopKeeper.find(query).sort({ totalDue: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ShopKeeper.countDocuments(query),
    ]);

    const allStats = await ShopKeeper.aggregate([
      { $group: { _id: null, totalDueAll: { $sum: '$totalDue' }, totalActiveCount: { $sum: { $cond: ['$isActive', 1, 0] } }, totalCount: { $sum: 1 } } },
    ]);
    const summary = allStats[0] || { totalDueAll: 0, totalActiveCount: 0, totalCount: 0 };

    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const monthlyCollected = await WholesalePayment.aggregate([
      { $match: { paymentDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      data: {
        shopKeepers, total, pages: Math.ceil(total / limitNum), currentPage: pageNum, limit: limitNum,
        summary: { ...summary, thisMonthCollected: monthlyCollected[0]?.total || 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shop keepers', error: (error as Error).message });
  }
});

// GET /api/admin/shopkeepers/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ success: false, message: 'Invalid ID' }); return; }
    const shopKeeper = await ShopKeeper.findById(id).lean();
    if (!shopKeeper) { res.status(404).json({ success: false, message: 'Shop keeper not found' }); return; }
    const orderCount = await WholesaleOrder.countDocuments({ shopKeeper: id });
    res.json({ success: true, data: { shopKeeper, orderCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch', error: (error as Error).message });
  }
});

// POST /api/admin/shopkeepers
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, shopName, phone, whatsapp, city, address, creditLimit, notes } = req.body;
    if (!name?.trim() || !shopName?.trim() || !phone?.trim() || !city?.trim()) {
      res.status(400).json({ success: false, message: 'Name, shop name, phone, and city are required' }); return;
    }
    const existing = await ShopKeeper.findOne({ phone: phone.trim() });
    if (existing) { res.status(400).json({ success: false, message: 'Phone number already exists' }); return; }

    const shopKeeper = new ShopKeeper({
      name: name.trim(), shopName: shopName.trim(), phone: phone.trim(),
      whatsapp: whatsapp?.trim() || undefined, city: city.trim(),
      address: address?.trim() || undefined, creditLimit: creditLimit || 100000,
      notes: notes?.trim() || undefined,
    });
    await shopKeeper.save();
    res.status(201).json({ success: true, data: shopKeeper, message: 'Shop keeper created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create', error: (error as Error).message });
  }
});

// PUT /api/admin/shopkeepers/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ success: false, message: 'Invalid ID' }); return; }
    const { name, shopName, phone, whatsapp, city, address, creditLimit, notes, isActive } = req.body;
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData['name'] = name.trim();
    if (shopName !== undefined) updateData['shopName'] = shopName.trim();
    if (phone !== undefined) updateData['phone'] = phone.trim();
    if (whatsapp !== undefined) updateData['whatsapp'] = whatsapp?.trim() || undefined;
    if (city !== undefined) updateData['city'] = city.trim();
    if (address !== undefined) updateData['address'] = address?.trim() || undefined;
    if (creditLimit !== undefined) updateData['creditLimit'] = Number(creditLimit);
    if (notes !== undefined) updateData['notes'] = notes?.trim() || undefined;
    if (isActive !== undefined) updateData['isActive'] = Boolean(isActive);

    const shopKeeper = await ShopKeeper.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!shopKeeper) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, data: shopKeeper, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update', error: (error as Error).message });
  }
});

// DELETE /api/admin/shopkeepers/:id — soft deactivate
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) { res.status(400).json({ success: false, message: 'Invalid ID' }); return; }
    const sk = await ShopKeeper.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    if (!sk) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, message: 'Deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed', error: (error as Error).message });
  }
});

// GET /api/admin/shopkeepers/:id/orders
router.get('/:id/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20', paymentStatus } = req.query as Record<string, string | undefined>;
    const query: Record<string, unknown> = { shopKeeper: id };
    if (paymentStatus) query['paymentStatus'] = paymentStatus;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;
    const [orders, total] = await Promise.all([
      WholesaleOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      WholesaleOrder.countDocuments(query),
    ]);
    res.json({ success: true, data: { orders, total, pages: Math.ceil(total / limitNum), currentPage: pageNum } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed', error: (error as Error).message });
  }
});

// GET /api/admin/shopkeepers/:id/payments
router.get('/:id/payments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query as Record<string, string | undefined>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;
    const [payments, total] = await Promise.all([
      WholesalePayment.find({ shopKeeper: id }).populate('order', 'orderId totalAmount').sort({ paymentDate: -1 }).skip(skip).limit(limitNum).lean(),
      WholesalePayment.countDocuments({ shopKeeper: id }),
    ]);
    res.json({ success: true, data: { payments, total, pages: Math.ceil(total / limitNum), currentPage: pageNum } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed', error: (error as Error).message });
  }
});

// GET /api/admin/shopkeepers/:id/ledger
router.get('/:id/ledger', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const shopKeeper = await ShopKeeper.findById(id).lean();
    if (!shopKeeper) { res.status(404).json({ success: false, message: 'Not found' }); return; }

    const [orders, payments] = await Promise.all([
      WholesaleOrder.find({ shopKeeper: id }).sort({ createdAt: 1 }).lean(),
      WholesalePayment.find({ shopKeeper: id }).sort({ paymentDate: 1 }).lean(),
    ]);

    type LedgerEntry = { date: Date; type: 'order' | 'payment'; description: string; amount: number; runningDue: number; referenceId: string; method?: string; };
    const entries: LedgerEntry[] = [];

    for (const o of orders) {
      entries.push({ date: o.createdAt, type: 'order', description: `New Order ${o.orderId}`, amount: o.totalAmount, runningDue: 0, referenceId: (o._id as mongoose.Types.ObjectId).toString() });
    }
    for (const p of payments) {
      entries.push({ date: p.paymentDate, type: 'payment', description: `${p.installmentNote ? p.installmentNote + ' — ' : ''}${p.method.replace('_', ' ')}`, amount: p.amount, runningDue: 0, referenceId: (p._id as mongoose.Types.ObjectId).toString(), method: p.method });
    }

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningDue = 0;
    for (const entry of entries) {
      runningDue = entry.type === 'order' ? runningDue + entry.amount : Math.max(0, runningDue - entry.amount);
      entry.runningDue = runningDue;
    }
    entries.reverse();

    res.json({
      success: true,
      data: {
        shopKeeper,
        ledger: entries,
        summary: { totalOrdered: shopKeeper.totalOrdered, totalPaid: shopKeeper.totalPaid, totalDue: shopKeeper.totalDue, orderCount: orders.length },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ledger', error: (error as Error).message });
  }
});

export default router;
