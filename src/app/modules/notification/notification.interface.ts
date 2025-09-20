import { Types } from 'mongoose';
import { ENUM_NOTIFICATION_TYPE } from './notification.enum';

export interface INotification {
  receiver: string;
  type: (typeof ENUM_NOTIFICATION_TYPE)[keyof typeof ENUM_NOTIFICATION_TYPE];
  message: string;
  data?: {
    reviewId?: Types.ObjectId;
    commentId?: Types.ObjectId;
    orderId?: Types.ObjectId;
    amount?: number;
    product?: {
      id: Types.ObjectId;
      name: string;
      quantity: number;
    };
  };
  isRead: boolean;
}
