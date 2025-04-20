import mongoose, { Schema, Model } from 'mongoose';
import { INotification } from './notification.interface';
import { ENUM_SENDER_TYPE } from '../../utilities/enum';
import { ENUM_NOTIFICATION_TYPE } from './notification.enum';

const NotificationSchema = new Schema<INotification>(
  {
    receiver: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      refPath: 'senderType',
      required: false,
    },
    senderType: {
      type: String,
      enum: Object.values(ENUM_SENDER_TYPE),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ENUM_NOTIFICATION_TYPE),
      required: true,
    },
    message: { type: String, required: true },
    data: {
      commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
      orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
      reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
      amount: { type: Number },
      product: {
        id: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        quantity: { type: Number },
      },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

NotificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  NotificationSchema,
);

export default Notification;
