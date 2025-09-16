import { model, Schema } from 'mongoose';
import { INotificationSetting } from './notificationSetting.interface';

const NotificationSettingSchema = new Schema<INotificationSetting>(
  {
    user: {
      type: String,
      required: true,
      unique: true,
    },
    pushNotification: { type: Boolean, default: true },
    mention: { type: Boolean, default: true },
    commentOnPost: { type: Boolean, default: true },
    likeOnPost: { type: Boolean, default: true },
    likeOnComment: { type: Boolean, default: true },
    newFollower: { type: Boolean, default: true },
    postYouFollow: { type: Boolean, default: true },
    trendingPost: { type: Boolean, default: true },
    newPost: { type: Boolean, default: true },
    postFromFollower: { type: Boolean, default: true },
    general: {
      type: Boolean,
      default: true,
    },
    customerNotification: {
      type: Boolean,
      default: true,
    },
    orderNotification: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const NotificationSetting = model<INotificationSetting>(
  'NotificationSetting',
  NotificationSettingSchema,
);
