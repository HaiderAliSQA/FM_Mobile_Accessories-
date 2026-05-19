// backend/src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Drop the legacy/stale unique index "orderNumber_1" if it exists in the database
    try {
      if (conn.connection.db) {
        const ordersCol = conn.connection.db.collection('orders');
        const indexes = await ordersCol.indexes();
        const hasOrderNumIndex = indexes.some((idx: any) => idx.name === 'orderNumber_1');
        if (hasOrderNumIndex) {
          console.log('🔄 Dropping stale unique orderNumber_1 index from orders collection...');
          await ordersCol.dropIndex('orderNumber_1');
          console.log('✅ Stale orderNumber_1 index dropped successfully!');
        }
      }
    } catch (idxError) {
      console.warn('⚠️ Stale index cleanup warning:', idxError);
    }

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // Removed process.exit(1) to allow server to stay alive for debugging and health checks
  }
};

export default connectDB;
