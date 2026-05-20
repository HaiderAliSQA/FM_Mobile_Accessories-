// backend/src/routes/orders.ts
import { Router, Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import calculateDeliveryFee from '../utils/calculateDeliveryFee';
import generateOrderId from '../utils/generateOrderId';
import { sendOrderEmail, generateOrderPDF } from '../utils/sendOrderEmail';

const router = Router();

// POST /api/orders - PUBLIC — place a new wholesale guest order
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      shopName,
      ownerName,
      phone,
      city,
      items,
      paymentSchedule,
      note,
    } = req.body as {
      shopName: string;
      ownerName: string;
      phone: string;
      city: string;
      items: Array<{
        productId: string;
        size?: number;
        color?: string;
        quantity: number;
      }>;
      paymentSchedule?: 'weekly' | 'monthly' | 'immediate';
      note?: string;
    };

    // Validate required B2B guest fields
    if (!shopName || !shopName.trim()) {
      res.status(400).json({ success: false, message: 'Shop Name is required' });
      return;
    }

    if (!ownerName || !ownerName.trim()) {
      res.status(400).json({ success: false, message: 'Owner/Contact Name is required' });
      return;
    }

    if (!phone || !/^03[0-9]{9}$/.test(phone)) {
      res.status(400).json({
        success: false,
        message: 'Phone number must be a valid Pakistani number (03XXXXXXXXX)',
      });
      return;
    }

    if (!city || !city.trim()) {
      res.status(400).json({ success: false, message: 'City is required' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must contain at least one item' });
      return;
    }

    const resolvedItems: Array<{
      productId: import('mongoose').Types.ObjectId;
      name: string;
      price: number;
      size?: number;
      color?: string;
      quantity: number;
      image: string;
      subtotal: number;
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

      if (item.quantity > product.stock) {
        const truncatedName = product.name.length > 40 ? product.name.substring(0, 37) + '...' : product.name;
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${truncatedName}". Available: ${product.stock}`,
        });
        return;
      }

      const itemPrice = Number(product.price) || 0;
      resolvedItems.push({
        productId: product._id,
        name: product.name,
        price: itemPrice,
        size: item.size ? Number(item.size) : undefined,
        color: item.color ? String(item.color) : undefined,
        quantity: Number(item.quantity),
        image: product.images?.[0] || '',
        subtotal: itemPrice * Number(item.quantity),
      });
    }

    const subtotal = resolvedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalQuantity = resolvedItems.reduce((sum, item) => sum + item.quantity, 0);
    const orderType = totalQuantity === 1 ? 'customer' : 'wholesale';
    const deliveryFee = totalQuantity === 1 ? 200 : 0;
    const totalAmount = subtotal + deliveryFee;

    const orderId = await generateOrderId();

    const order = new Order({
      orderId,
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      phone,
      city: city.trim(),
      items: resolvedItems,
      subtotal,
      deliveryFee,
      discount: 0,
      totalAmount,
      totalPaid: 0,
      totalDue: totalAmount,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      paymentSchedule: paymentSchedule || 'weekly',
      note: note?.trim() || undefined,
      orderType,
    });

    await order.save();

    // Map to a compatible structure for sendOrderEmail PDF helper
    const orderData = {
      orderNumber:      order.orderId,
      customerName:     order.ownerName,
      customerPhone:    order.phone,
      customerEmail:    'Not provided',
      customerAddress:  order.shopName,
      customerCity:     order.city,
      items:            order.items.map((item) => ({
        name:     item.name,
        size:     item.size || 0,
        color:    item.color || 'N/A',
        quantity: item.quantity,
        price:    item.price,
      })),
      subtotal:         order.subtotal,
      deliveryCharges:  order.deliveryFee,
      totalAmount:      order.totalAmount,
      paymentMethod:    'cod',
      paymentStatus:    order.paymentStatus,
      notes:            order.note,
      createdAt:        order.createdAt,
    };

    // Send admin email ASYNC (fire-and-forget)
    sendOrderEmail(orderData).catch((err: Error) =>
      console.error('Email notification failed:', err)
    );

    // Atomically decrement stock
    for (const item of resolvedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Wholesale guest order placed successfully',
    });
  } catch (error) {
    console.error('❌ B2B ORDER PLACEMENT CRITICAL EXCEPTION:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to place B2B wholesale order',
      error: (error as Error).message,
    });
  }
});

// GET /api/orders/by-number/:orderId - PUBLIC — find by orderId
router.get('/by-number/:orderId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId
    }).populate('items.productId', 'name images');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Wholesale order not found'
      });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id/receipt — Download PDF receipt (PUBLIC)
router.get('/:id/receipt', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      orderNumber:      order.orderId,
      customerName:     order.ownerName,
      customerPhone:    order.phone,
      customerEmail:    'Not provided',
      customerAddress:  order.shopName,
      customerCity:     order.city,
      items:            order.items.map((item) => ({
        name:     item.name,
        size:     item.size || 0,
        color:    item.color || 'N/A',
        quantity: item.quantity,
        price:    item.price,
      })),
      subtotal:         order.subtotal,
      deliveryCharges:  order.deliveryFee,
      totalAmount:      order.totalAmount,
      paymentMethod:    'cod',
      paymentStatus:    order.paymentStatus,
      notes:            order.note,
      createdAt:        order.createdAt,
    };

    const pdfBuffer = await generateOrderPDF(orderData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Order_${order.orderId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
