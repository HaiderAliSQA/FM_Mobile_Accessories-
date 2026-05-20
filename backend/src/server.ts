// backend/src/server.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import configureCloudinary from './config/cloudinary';
import { verifyEmailConnection } from './config/email';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payment';
import uploadRoutes from './routes/upload';
import shopKeeperRoutes from './routes/shopKeepers';
import wholesaleOrderRoutes from './routes/wholesaleOrders';
import wholesalePaymentRoutes from './routes/wholesalePayments';
import adminOrderRoutes from './routes/adminOrders';
import adminPaymentRoutes from './routes/adminPayments';
import adminDashboardRoutes from './routes/adminDashboard';
import errorHandler, { notFoundHandler } from './middleware/errorHandler';
import customLogger from './middleware/customLogger';

const app = express();
const PORT = parseInt(process.env.PORT ?? '5001', 10);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5174',
  'https://fmmobile.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(customLogger);
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'FH Mobile Accessories API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);

// Wholesale / Admin B2B Routes
app.use('/api/admin/shopkeepers', shopKeeperRoutes);
app.use('/api/admin/wholesale-orders', wholesaleOrderRoutes);
app.use('/api/admin/wholesale-payments', wholesalePaymentRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    // Background migration for legacy orders missing orderType field
    try {
      const Order = (await import('./models/Order')).default;
      const count = await Order.countDocuments({ orderType: { $exists: false } });
      if (count > 0) {
        console.log(`🔄 [Migration] Found ${count} legacy orders without orderType. Migrating...`);
        const legacyOrders = await Order.find({ orderType: { $exists: false } });
        for (const order of legacyOrders) {
          const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
          order.orderType = totalQty === 1 ? 'customer' : 'wholesale';
          await order.save({ validateBeforeSave: false });
        }
        console.log(`✅ [Migration] Legacy orders migration complete!`);
      }
    } catch (migErr) {
      console.error('⚠️ [Migration] Failed to migrate legacy orders:', migErr);
    }

    await verifyEmailConnection();
    configureCloudinary();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 FH Mobile Accessories API`);
      console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   Health      : http://localhost:${PORT}/api/health`);
      console.log(`   Started at  : ${new Date().toLocaleString()}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;
