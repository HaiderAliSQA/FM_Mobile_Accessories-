// backend/src/models/WholesalePayment.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export type WholesalePaymentMethod =
  | 'cash'
  | 'jazzcash'
  | 'easypaisa'
  | 'bank_transfer'
  | 'cheque';

export interface IWholesalePayment extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;       // WholesaleOrder ref
  shopKeeper: mongoose.Types.ObjectId;  // ShopKeeper ref

  // Payment Details
  amount: number;
  method: WholesalePaymentMethod;
  transactionId?: string;
  paymentDate: Date;
  installmentNote?: string;  // e.g. "Week 1", "January installment"
  recordedBy: string;

  // Snapshot at time of payment
  orderTotalAtTime: number;
  paidBeforeThis: number;
  dueAfterThis: number;  // orderTotal - (paidBefore + thisAmount)

  createdAt: Date;
  updatedAt: Date;
}

const wholesalePaymentSchema = new Schema<IWholesalePayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'WholesaleOrder',
      required: [true, 'Order reference is required'],
    },
    shopKeeper: {
      type: Schema.Types.ObjectId,
      ref: 'ShopKeeper',
      required: [true, 'Shop keeper reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    method: {
      type: String,
      enum: ['cash', 'jazzcash', 'easypaisa', 'bank_transfer', 'cheque'],
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      default: undefined,
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    installmentNote: {
      type: String,
      default: undefined,
      trim: true,
    },
    recordedBy: {
      type: String,
      default: 'admin',
      trim: true,
    },
    // Snapshot fields
    orderTotalAtTime: {
      type: Number,
      required: true,
      min: 0,
    },
    paidBeforeThis: {
      type: Number,
      required: true,
      min: 0,
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

// Indexes
wholesalePaymentSchema.index({ order: 1 });
wholesalePaymentSchema.index({ shopKeeper: 1 });
wholesalePaymentSchema.index({ paymentDate: -1 });
wholesalePaymentSchema.index({ method: 1 });

const WholesalePayment: Model<IWholesalePayment> = mongoose.model<IWholesalePayment>(
  'WholesalePayment',
  wholesalePaymentSchema
);

export default WholesalePayment;
