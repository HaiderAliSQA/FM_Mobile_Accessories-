// backend/src/models/WholesaleOrder.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export type WholesalePaymentStatus = 'unpaid' | 'partial' | 'paid';
export type WholesaleOrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type WholesalePaymentSchedule = 'weekly' | 'monthly' | 'custom' | 'immediate';

export interface IWholesaleOrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  brand?: string;
  image?: string;
  price: number;     // wholesale price per unit
  quantity: number;
  subtotal: number;  // price * quantity
}

export interface IWholesaleOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: string;   // Auto-generated: FH-20250418-001
  shopKeeper: mongoose.Types.ObjectId;

  // Items
  items: IWholesaleOrderItem[];

  // Amounts
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;  // subtotal + deliveryFee - discount

  // Payment Tracking
  totalPaid: number;
  totalDue: number;     // auto-calculated via pre-save hook

  // Status
  paymentStatus: WholesalePaymentStatus;
  orderStatus: WholesaleOrderStatus;

  // Payment Schedule
  paymentSchedule: WholesalePaymentSchedule;
  expectedPaymentDate?: Date;

  // Notes
  adminNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const wholesaleOrderItemSchema = new Schema<IWholesaleOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: undefined,
    },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: undefined, trim: true },
    image: { type: String, default: undefined },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const wholesaleOrderSchema = new Schema<IWholesaleOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    shopKeeper: {
      type: Schema.Types.ObjectId,
      ref: 'ShopKeeper',
      required: [true, 'Shop keeper is required'],
    },
    items: {
      type: [wholesaleOrderItemSchema],
      required: true,
      validate: {
        validator: (v: IWholesaleOrderItem[]) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    totalDue: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentSchedule: {
      type: String,
      enum: ['weekly', 'monthly', 'custom', 'immediate'],
      default: 'weekly',
    },
    expectedPaymentDate: {
      type: Date,
      default: undefined,
    },
    adminNotes: {
      type: String,
      default: undefined,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totalDue and paymentStatus before every save
wholesaleOrderSchema.pre('save', function (next) {
  this.totalDue = Math.max(0, this.totalAmount - this.totalPaid);
  if (this.totalPaid <= 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.totalPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  next();
});

// Indexes
wholesaleOrderSchema.index({ shopKeeper: 1 });
wholesaleOrderSchema.index({ paymentStatus: 1 });
wholesaleOrderSchema.index({ orderStatus: 1 });
wholesaleOrderSchema.index({ createdAt: -1 });

const WholesaleOrder: Model<IWholesaleOrder> = mongoose.model<IWholesaleOrder>(
  'WholesaleOrder',
  wholesaleOrderSchema
);

export default WholesaleOrder;
