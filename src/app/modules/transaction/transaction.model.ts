import { Schema, model } from 'mongoose';
import {
  ENUM_TRANSACTION_REASON,
  ENUM_TRANSACTION_TYPE,
} from './transaction.enum';
import { ITransaction } from './transaction.interface';

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    type: {
      type: String,
      enum: Object.values(ENUM_TRANSACTION_TYPE),
      required: true,
    },

    amount: { type: Number, required: true, min: 0 },

    transactionId: { type: String, required: true, unique: true },

    transactionReason: {
      type: String,
      enum: Object.values(ENUM_TRANSACTION_REASON),
      required: true,
    },

    description: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Transaction = model<ITransaction>(
  'Transaction',
  TransactionSchema,
);
