import { Types } from 'mongoose';

export interface INotificationSetting {
  user: Types.ObjectId;
  pushNotification: boolean;
  mention: boolean;
  commentOnPost: boolean;
  likeOnPost: boolean;
  likeOnComment: boolean;
  newFollower: boolean;
  postYouFollow: boolean;
  trendingPost: boolean;
  newPost: boolean;
  postFromFollower: boolean;
  general: boolean;
  customerNotification: boolean;
  orderNotification: boolean;
}
