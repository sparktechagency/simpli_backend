export interface INotificationSetting {
  user: string;
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
  campaign: boolean;
  payment: boolean;
}
