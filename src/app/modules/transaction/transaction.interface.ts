import { Types } from 'mongoose';
import { ENUM_TRANSACTION_STATUS } from '../../utilities/enum';

export interface ITransaction {
  paymentSender: Types.ObjectId | null;
  item: string;
  amount: number;
  status: (typeof ENUM_TRANSACTION_STATUS)[keyof typeof ENUM_TRANSACTION_STATUS];
  transactionId: string;
  paymentReceiver: Types.ObjectId | null;
}
