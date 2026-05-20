// backend/src/models/Order.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  size?: number;
  color?: string;
  quantity: number;
  image: string;
  subtotal: number;
}

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
export type PaymentSchedule = 'weekly' | 'monthly' | 'immediate';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: string;
  shopName: string;
  ownerName: string;
  phone: string;
  city: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentSchedule: PaymentSchedule;
  note?: string;
  adminNote?: string;
  orderType: 'customer' | 'wholesale';
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: Number, default: undefined },
    color: { type: String, default: undefined },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop Name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner/Contact Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^03[0-9]{9}$/, 'Phone must be a valid Pakistani number (03XXXXXXXXX)'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
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
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentSchedule: {
      type: String,
      enum: ['weekly', 'monthly', 'immediate'],
      default: 'weekly',
    },
    note: {
      type: String,
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ['customer', 'wholesale'],
      required: true,
      default: function(this: any) {
        if (this.items && this.items.length > 0) {
          const totalQty = this.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          return totalQty === 1 ? 'customer' : 'wholesale';
        }
        return 'customer';
      }
    },
  },
  {
    timestamps: true,
  }
);

// Recalculate totalDue and paymentStatus automatically before saving
orderSchema.pre<IOrder>('save', function (next) {
  this.totalDue = Math.max(0, this.totalAmount - this.totalPaid);
  
  if (this.totalPaid === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.totalPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  next();
});

orderSchema.index({ phone: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderType: 1 });

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
