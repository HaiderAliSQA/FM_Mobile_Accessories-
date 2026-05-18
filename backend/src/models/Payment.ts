// backend/src/models/Payment.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export type PaymentMethod = 'cash' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'cheque';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  shopName: string;
  phone: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  paymentDate: Date;
  installmentNote?: string;
  orderTotalAtTime: number;
  paidBeforeThis: number;
  dueAfterThis: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    method: {
      type: String,
      enum: ['cash', 'jazzcash', 'easypaisa', 'bank_transfer', 'cheque'],
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    installmentNote: {
      type: String,
      trim: true,
    },
    orderTotalAtTime: {
      type: Number,
      required: true,
    },
    paidBeforeThis: {
      type: Number,
      required: true,
    },
    dueAfterThis: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ phone: 1 });
paymentSchema.index({ paymentDate: -1 });

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
