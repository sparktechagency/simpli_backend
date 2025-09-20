// export const ENUM_NOTIFICATION_TYPE = {
//   LIKE: 'Like',
//   COMMENT: 'Comment',
//   FOLLOW: 'Follow',
//   REPLY: 'Reply',
//   ORDER: 'Order',
//   ORDER_SHIPPED: 'ORDER_SHIPPED',
//   REVIEW: 'Review',
//   REVIEW_REQUEST: 'REVIEW_REQUEST',
//   REVIEW_PRODUCT_SHIPPED: 'REVIEW_PRODUCT_SHIPPED',
//   PAYMENT: 'Payment',
//   SHIPPING: 'Shipping',
//   ANNOUNCEMENT: 'Announcement',
//   SYSTEM_UPDATE: 'SYSTEM_UPDATE',
//   GENERAL: 'General',
//   PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
// };

export const ENUM_NOTIFICATION_TYPE = {
  LIKE: 'likeOnPost',
  COMMENT: 'commentOnPost',
  FOLLOW: 'newFollower',
  REPLY: 'mention',
  ORDER: 'orderNotification',
  ORDER_SHIPPED: 'orderNotification',
  REVIEW: 'customerNotification',
  REVIEW_REQUEST: 'customerNotification',
  REVIEW_PRODUCT_SHIPPED: 'customerNotification',
  PAYMENT: 'customerNotification',
  SHIPPING: 'customerNotification',
  ANNOUNCEMENT: 'general',
  SYSTEM_UPDATE: 'general',
  GENERAL: 'general',
  PAYMENT_RECEIVED: 'customerNotification',
} as const;

export type NotificationTypeKey = keyof typeof ENUM_NOTIFICATION_TYPE;
export type NotificationSettingField =
  (typeof ENUM_NOTIFICATION_TYPE)[NotificationTypeKey];
