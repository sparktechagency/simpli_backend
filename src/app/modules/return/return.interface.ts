import { Types } from 'mongoose';
import { IOrderItem } from '../order/order.interface';
import { ENUM_RETURN_METHOD, ENUM_RETURN_STATUS } from './return.enum';

export interface IReturn {
  bussiness: Types.ObjectId;
  reviewer: Types.ObjectId;
  items: IOrderItem[];
  orderId: Types.ObjectId;
  transactionId: string;
  totalReturnAmount?: number;
  returnMethod: (typeof ENUM_RETURN_METHOD)[keyof typeof ENUM_RETURN_METHOD];
  status: (typeof ENUM_RETURN_STATUS)[keyof typeof ENUM_RETURN_STATUS];
  refundTransactionId?: string;
  refundData?: Date;
}
