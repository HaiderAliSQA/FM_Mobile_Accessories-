// backend/src/routes/orders.ts
import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import authMiddleware from '../middleware/authMiddleware';
import generateOrderNumber from '../utils/generateOrderNumber';
import { sendOrderEmail, generateOrderPDF } from '../utils/sendOrderEmail';

const router = Router();

const DELIVERY_CHARGE = 300;
const FREE_DELIVERY_THRESHOLD = 5000;

// POST /api/orders - PUBLIC — place a new order
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity,
      customerPostalCode,
      items,
      paymentMethod,
      transactionId,
      notes,
    } = req.body as {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      customerAddress: string;
      customerCity: string;
      customerPostalCode?: string;
      items: Array<{
        productId: string;
        size: number;
        color: string;
        quantity: number;
      }>;
      paymentMethod: string;
      transactionId?: string;
      notes?: string;
    };

    // Validate required fields
    if (!customerName || !customerName.trim()) {
      res.status(400).json({ success: false, message: 'Customer name is required' });
      return;
    }

    if (!customerPhone || !/^03[0-9]{9}$/.test(customerPhone)) {
      res.status(400).json({
        success: false,
        message: 'Phone number must be in Pakistani format (03XXXXXXXXX)',
      });
      return;
    }

    if (!customerAddress || !customerAddress.trim()) {
      res.status(400).json({ success: false, message: 'Customer address is required' });
      return;
    }

    if (!customerCity || !customerCity.trim()) {
      res.status(400).json({ success: false, message: 'Customer city is required' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must contain at least one item' });
      return;
    }

    const validPaymentMethods = ['jazzcash', 'easypaisa', 'bank_transfer', 'cod'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      res.status(400).json({ success: false, message: 'Invalid payment method' });
      return;
    }

    // Validate and price each item from DB — never trust client prices
    const resolvedItems: Array<{
      productId: import('mongoose').Types.ObjectId;
      name: string;
      price: number;
      size?: number;
      color?: string;
      quantity: number;
      image: string;
    }> = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        res.status(400).json({
          success: false,
          message: 'Each item must have a productId and quantity',
        });
        return;
      }

      if (item.quantity < 1) {
        res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        return;
      }

      // Use lean() to bypass getter transformations — ensures raw stock value from DB
      const product = await Product.findById(item.productId).lean();

      if (!product) {
        res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
        return;
      }

      if (!product.isVisible || product.isDiscontinued) {
        res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`,
        });
        return;
      }

      if (product.sizes && product.sizes.length > 0 && item.size) {
        const sizeEntry = product.sizes.find((s) => s.size === item.size);

        if (!sizeEntry) {
          res.status(400).json({
            success: false,
            message: `Size ${item.size} is not available for "${product.name}"`,
          });
          return;
        }

        if (sizeEntry.isBlocked) {
          res.status(400).json({
            success: false,
            message: `Size ${item.size} is currently unavailable for "${product.name}"`,
          });
          return;
        }
      }

      if (item.quantity > product.stock) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
        return;
      }

      resolvedItems.push({
        productId: product._id,
        name: product.name,
        price: Number(product.price), // FORCE Number
        size: item.size ? Number(item.size) : undefined,
        color: item.color ? String(item.color) : undefined,
        quantity: Number(item.quantity), // FORCE Number
        image: product.images?.[0] || '',
      });
    }

    // Calculate totals from DB prices — parse everything explicitly
    const subtotal = resolvedItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    const deliveryCharges = Number(subtotal) >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const totalAmount = Number(subtotal) + Number(deliveryCharges);

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = new Order({
      orderNumber,
      customerName: customerName.trim(),
      customerPhone,
      customerEmail: customerEmail?.trim().toLowerCase() || undefined,
      customerAddress: customerAddress.trim(),
      customerCity: customerCity.trim(),
      customerPostalCode: customerPostalCode?.trim() || undefined,
      items: resolvedItems,
      subtotal,
      deliveryCharges,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      transactionId: transactionId?.trim() || undefined,
      notes: notes?.trim() || undefined,
      emailSent: false,
    });

    await order.save();

    const orderData = {
      orderNumber:      order.orderNumber,
      customerName:     order.customerName,
      customerPhone:    order.customerPhone,
      customerEmail:    order.customerEmail,
      customerAddress:  order.customerAddress,
      customerCity:     order.customerCity,
      items:            order.items.map((item: any) => ({
        name:     item.name,
        size:     item.size,
        color:    item.color,
        quantity: item.quantity,
        price:    item.price,
      })),
      subtotal:         order.subtotal,
      deliveryCharges:  order.deliveryCharges,
      totalAmount:      order.totalAmount,
      paymentMethod:    order.paymentMethod,
      paymentStatus:    order.paymentStatus,
      transactionId:    order.transactionId,
      notes:            order.notes,
      createdAt:        order.createdAt,
    };

    // Send admin email ASYNC — do NOT await (fire-and-forget)
    sendOrderEmail(orderData).catch((err: Error) =>
      console.error('Email error:', err)
    );

    order.emailSent = true;
    await order.save();

    // Decrement stock atomically using $inc
    for (const item of resolvedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }


    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order placed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: (error as Error).message,
    });
  }
});

// GET /api/orders - ADMIN ONLY with pagination and filters
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      orderStatus,
      paymentMethod,
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

    if (paymentMethod && paymentMethod !== 'all') {
      query['paymentMethod'] = paymentMethod;
    }

    if (search) {
      query['$or'] = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
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
      message: 'Failed to fetch orders',
      error: (error as Error).message,
    });
  }
});

// GET /api/orders/by-number/:orderNumber — find by orderNumber field
router.get('/by-number/:orderNumber', async (req: Request, res: Response, next): Promise<void> => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber
    }).populate('items.productId', 'name images')

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - ADMIN ONLY — single order with populated products
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const order = await Order.findById(id)
      .populate('items.productId', 'name slug images category')
      .lean();

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: (error as Error).message,
    });
  }
});

// GET /api/orders/:id/receipt — Download PDF receipt
// PUBLIC (customer can download their own receipt using orderNumber)
router.get('/:id/receipt', async (req: Request, res: Response, next): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name images');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    const orderData = {
      orderNumber:      order.orderNumber,
      customerName:     order.customerName,
      customerPhone:    order.customerPhone,
      customerEmail:    order.customerEmail,
      customerAddress:  order.customerAddress,
      customerCity:     order.customerCity,
      items:            order.items.map((item: any) => ({
        name:     item.name,
        size:     item.size,
        color:    item.color,
        quantity: item.quantity,
        price:    item.price,
      })),
      subtotal:         order.subtotal,
      deliveryCharges:  order.deliveryCharges,
      totalAmount:      order.totalAmount,
      paymentMethod:    order.paymentMethod,
      paymentStatus:    order.paymentStatus,
      transactionId:    order.transactionId,
      notes:            order.notes,
      createdAt:        order.createdAt,
    };

    const pdfBuffer = await generateOrderPDF(orderData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Order_${order.orderNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);

  } catch (error) {
    next(error);
  }
});

// PATCH /api/orders/:id/status - ADMIN ONLY
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { orderStatus, transactionId } = req.body as {
      orderStatus?: string;
      transactionId?: string;
    };

    const validStatuses = [
      'pending', 'confirmed', 'processing', 'shipped',
      'delivered', 'cancelled', 'returned',
    ];

    if (orderStatus && !validStatuses.includes(orderStatus)) {
      res.status(400).json({ success: false, message: 'Invalid order status' });
      return;
    }

    const updateData: Record<string, string> = {};
    if (orderStatus) updateData['orderStatus'] = orderStatus;
    if (transactionId) updateData['transactionId'] = transactionId;

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: (error as Error).message,
    });
  }
});

export default router;
