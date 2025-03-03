import { Types } from 'mongoose';
import { ENUM_RECEIVER_TYPE, ENUM_SENDER_TYPE } from '../../utilities/enum';

export interface INotification {
  receiver: Types.ObjectId;
  receiverType: (typeof ENUM_RECEIVER_TYPE)[keyof typeof ENUM_RECEIVER_TYPE];
  sender?: Types.ObjectId | null;
  senderType: (typeof ENUM_SENDER_TYPE)[keyof typeof ENUM_SENDER_TYPE];
}
