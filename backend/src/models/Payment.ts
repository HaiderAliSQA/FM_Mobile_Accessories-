// backend/src/models/Payment.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export type PaymentRecordStatus = 'pending' | 'success' | 'failed';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  method: string;
  amount: number;
  transactionId: string;
  status: PaymentRecordStatus;
  gatewayResponse: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment: Model<IPayment> = mongoose.model<IPayment>(
  'Payment',
  paymentSchema
);

export default Payment;
