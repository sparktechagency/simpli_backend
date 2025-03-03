import { Types } from 'mongoose';
import {
  ENUM_NOTIFICATION_TYPE,
  ENUM_RECEIVER_TYPE,
  ENUM_SENDER_TYPE,
} from '../../utilities/enum';

export interface INotification {
  receiver: Types.ObjectId;
  receiverType: (typeof ENUM_RECEIVER_TYPE)[keyof typeof ENUM_RECEIVER_TYPE];
  sender?: Types.ObjectId | null;
  senderType: (typeof ENUM_SENDER_TYPE)[keyof typeof ENUM_SENDER_TYPE];
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
