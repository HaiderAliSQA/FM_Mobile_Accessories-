// backend/src/models/ShopKeeper.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IShopKeeper extends Document {
  _id: mongoose.Types.ObjectId;
  // Basic Info
  name: string;
  shopName: string;
  phone: string;
  whatsapp?: string;
  city: string;
  address?: string;
  // Business Info
  creditLimit: number;
  // Account Status
  isActive: boolean;
  joinedAt: Date;
  // Running totals — auto-calculated, stored for fast dashboard queries
  totalOrdered: number; // lifetime total PKR ordered
  totalPaid: number;    // lifetime total PKR paid
  totalDue: number;     // current outstanding (totalOrdered - totalPaid)
  // Admin notes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shopKeeperSchema = new Schema<IShopKeeper>(
  {
    name: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      default: undefined,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      default: undefined,
      trim: true,
    },
    creditLimit: {
      type: Number,
      default: 100000,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    totalOrdered: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDue: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: undefined,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
shopKeeperSchema.index({ city: 1 });
shopKeeperSchema.index({ isActive: 1 });
shopKeeperSchema.index({ totalDue: -1 });

const ShopKeeper: Model<IShopKeeper> = mongoose.model<IShopKeeper>(
  'ShopKeeper',
  shopKeeperSchema
);

export default ShopKeeper;
