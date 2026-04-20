// backend/src/routes/payment.ts
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Payment from '../models/Payment';
import authMiddleware from '../middleware/authMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Format datetime as YYYYMMDDHHMMSS
const formatDateTime = (date: Date): string => {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
};

// Add 1 hour to a datetime string YYYYMMDDHHMMSS
const addOneHour = (dateTimeStr: string): string => {
  const year = parseInt(dateTimeStr.substring(0, 4), 10);
  const month = parseInt(dateTimeStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateTimeStr.substring(6, 8), 10);
  const hour = parseInt(dateTimeStr.substring(8, 10), 10);
  const minute = parseInt(dateTimeStr.substring(10, 12), 10);
  const second = parseInt(dateTimeStr.substring(12, 14), 10);

  const dt = new Date(year, month, day, hour + 1, minute, second);
  return formatDateTime(dt);
};

// POST /api/payment/jazzcash - PUBLIC
router.post('/jazzcash', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, customerPhone } = req.body as {
      orderId: string;
      amount: number;
      customerPhone: string;
    };

    if (!orderId || !amount || !customerPhone) {
      res.status(400).json({ success: false, message: 'orderId, amount, and customerPhone are required' });
      return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.paymentStatus !== 'pending') {
      res.status(400).json({ success: false, message: 'Order payment is not pending' });
      return;
    }

    const merchantId = process.env.JAZZCASH_MERCHANT_ID ?? '';
    const password = process.env.JAZZCASH_PASSWORD ?? '';
    const salt = process.env.JAZZCASH_INTEGRITY_SALT ?? '';
    const jazzcashUrl = process.env.JAZZCASH_URL ?? 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction';

    const txnRefNo = `KM${Date.now()}`;
    const now = new Date();
    const txnDateTime = formatDateTime(now);
    const txnExpiryDateTime = addOneHour(txnDateTime);
    const amountStr = (amount * 100).toString().padStart(10, '0');

    const payload: Record<string, string> = {
      pp_Version: '2.0',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amountStr,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: orderId,
      pp_Description: 'FM Mobile Accessories Order',
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_MobileNumber: customerPhone,
      pp_CNIC: '',
    };

    // Sort keys alphabetically and build hash string
    const sortedKeys = Object.keys(payload).sort();
    const hashString = salt + '&' + sortedKeys.map((k) => payload[k]).join('&');
    const secureHash = crypto
      .createHmac('sha256', salt)
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    payload['pp_SecureHash'] = secureHash;

    // Post to JazzCash API
    const apiResponse = await fetch(jazzcashUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const gatewayData = (await apiResponse.json()) as Record<string, unknown>;
    const responseCode = gatewayData['pp_ResponseCode'] as string | undefined;
    const isSuccess = responseCode === '000';

    // Save payment record
    const payment = new Payment({
      orderId: order._id,
      method: 'jazzcash',
      amount,
      transactionId: txnRefNo,
      status: isSuccess ? 'success' : 'failed',
      gatewayResponse: gatewayData,
    });
    await payment.save();

    if (isSuccess) {
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          paymentStatus: 'paid',
          transactionId: txnRefNo,
        },
      });
    }

    res.status(200).json({
      success: isSuccess,
      data: {
        responseCode,
        message: gatewayData['pp_ResponseMessage'] ?? (isSuccess ? 'Payment successful' : 'Payment failed'),
        transactionId: txnRefNo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'JazzCash payment failed',
      error: (error as Error).message,
    });
  }
});

// POST /api/payment/easypaisa - PUBLIC
router.post('/easypaisa', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, customerPhone } = req.body as {
      orderId: string;
      amount: number;
      customerPhone: string;
    };

    if (!orderId || !amount || !customerPhone) {
      res.status(400).json({ success: false, message: 'orderId, amount, and customerPhone are required' });
      return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.paymentStatus !== 'pending') {
      res.status(400).json({ success: false, message: 'Order payment is not pending' });
      return;
    }

    const storeId = process.env.EASYPAISA_STORE_ID ?? '';
    const hashKey = process.env.EASYPAISA_HASH_KEY ?? '';

    const txnRefNo = `KM${Date.now()}`;
    const now = new Date();
    const orderDate = formatDateTime(now);

    const payload: Record<string, string> = {
      storeId,
      orderId,
      transactionAmount: amount.toFixed(2),
      mobileAccountNo: customerPhone,
      emailAddress: '',
      orderDate,
      expiryDate: addOneHour(orderDate),
      tokenExpiry: addOneHour(orderDate),
      bankIdentificationNumber: '',
      description: 'FM Mobile Accessories Order',
    };

    const sortedKeys = Object.keys(payload).sort();
    const hashString = sortedKeys.map((k) => `${k}=${payload[k]}`).join('&');
    const hash = crypto
      .createHmac('sha256', hashKey)
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    payload['hash'] = hash;
    payload['paymentMode'] = 'MA';

    const payment = new Payment({
      orderId: order._id,
      method: 'easypaisa',
      amount,
      transactionId: txnRefNo,
      status: 'pending',
      gatewayResponse: payload,
    });
    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        transactionId: txnRefNo,
        message: 'Easypaisa payment initiated. Complete payment on your Easypaisa app.',
        payload,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Easypaisa payment failed',
      error: (error as Error).message,
    });
  }
});

// POST /api/payment/callback - PUBLIC webhook from payment gateways
router.post('/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, string>;

    const salt = process.env.JAZZCASH_INTEGRITY_SALT ?? '';
    const receivedHash = body['pp_SecureHash'];

    if (receivedHash && salt) {
      const payloadWithoutHash: Record<string, string> = { ...body };
      delete payloadWithoutHash['pp_SecureHash'];

      const sortedKeys = Object.keys(payloadWithoutHash).sort();
      const hashString = salt + '&' + sortedKeys.map((k) => payloadWithoutHash[k]).join('&');
      const calculatedHash = crypto
        .createHmac('sha256', salt)
        .update(hashString)
        .digest('hex')
        .toUpperCase();

      if (calculatedHash !== receivedHash) {
        res.status(400).json({ success: false, message: 'Invalid secure hash' });
        return;
      }

      const orderId = body['pp_BillReference'];
      const responseCode = body['pp_ResponseCode'];

      if (orderId) {
        const isSuccess = responseCode === '000';
        await Order.findByIdAndUpdate(orderId, {
          $set: { paymentStatus: isSuccess ? 'paid' : 'failed' },
        });

        await Payment.findOneAndUpdate(
          { orderId },
          { $set: { status: isSuccess ? 'success' : 'failed', gatewayResponse: body } }
        );
      }
    }

    res.status(200).json({ success: true, message: 'Callback received' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Callback processing failed',
      error: (error as Error).message,
    });
  }
});

// GET /api/payment/verify/:transactionId - PUBLIC
router.get('/verify/:transactionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params as { transactionId: string };

    const payment = await Payment.findOne({ transactionId })
      .populate('orderId', 'orderNumber orderStatus paymentStatus totalAmount')
      .lean();

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: (error as Error).message,
    });
  }
});

export default router;
