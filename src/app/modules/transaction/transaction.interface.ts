import { Types } from 'mongoose';
import {
  ENUM_TRANSACTION_REASON,
  ENUM_TRANSACTION_TYPE,
} from './transaction.enum';

export interface ITransaction {
  userType: 'Reviewer' | 'Bussiness';
  user: Types.ObjectId;
  type: (typeof ENUM_TRANSACTION_TYPE)[keyof typeof ENUM_TRANSACTION_TYPE];
  amount: number;
  transactionId: string;
  transactionReason: (typeof ENUM_TRANSACTION_REASON)[keyof typeof ENUM_TRANSACTION_REASON];
  description?: string;
}
