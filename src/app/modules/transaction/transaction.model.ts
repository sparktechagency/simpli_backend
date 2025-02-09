import { model, Schema } from 'mongoose';
import { ITransaction } from './transaction.interface';
import { ENUM_TRANSACTION_STATUS } from '../../utilities/enum';

const TransactionSchema = new Schema<ITransaction>(
  {
    paymentSender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    item: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ENUM_TRANSACTION_STATUS),
      required: true,
    },
    transactionId: { type: String, unique: true, required: true },
    paymentReceiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
);

const Transaction = model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
