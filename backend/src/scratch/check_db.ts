// backend/src/scratch/check_db.ts
import mongoose from 'mongoose';
import 'dotenv/config';
import Order from '../models/Order';

const check = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is not defined');
  
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB to verify order...');
  
  const latestOrder = await Order.findOne().sort({ createdAt: -1 });
  if (latestOrder) {
    console.log('📦 LATEST ORDER IN DB:');
    console.log(JSON.stringify(latestOrder, null, 2));
  } else {
    console.log('❌ No orders found in DB!');
  }
  
  await mongoose.disconnect();
};

check().catch(console.error);
