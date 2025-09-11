// import { Document, Types } from 'mongoose';
// import {
//   ENUM_DELIVERY_STATUS,
//   ENUM_PAYMENT_METHOD,
//   ENUM_PAYMENT_STATUS,
// } from '../../utilities/enum';

// export interface IOrderItem {
//   product: Types.ObjectId;
//   variant: Types.ObjectId | null;
//   quantity: number;
//   price: number;
//   referral?: {
//     reviewerId: Types.ObjectId;
//     reviewId: Types.ObjectId;
//     amount: Types.ObjectId;
//   } | null;
// }

// export interface IOrder extends Document {
//   reviewer: Types.ObjectId;
//   bussiness: Types.ObjectId;
//   shippingAddress: Types.ObjectId;
//   items: IOrderItem[];
//   totalQuantity: number;
//   subTotal: number;
//   deliveryFee: number;
//   totalPrice: number;
//   paymentMethod: (typeof ENUM_PAYMENT_METHOD)[keyof typeof ENUM_PAYMENT_METHOD];
//   paymentStatus: (typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
//   deliveryStatus: (typeof ENUM_DELIVERY_STATUS)[keyof typeof ENUM_DELIVERY_STATUS];
//   isReferralAmountPaid: boolean;
// }

import { Document, Types } from 'mongoose';
import {
  ENUM_DELIVERY_STATUS,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';

export interface IOrderItem {
  product: Types.ObjectId;
  variant: Types.ObjectId | null;
  quantity: number;
  price: number;
  referral?: {
    reviewerId: Types.ObjectId;
    reviewId: Types.ObjectId;
    amount: number;
  } | null;
}

export interface IShippingInfo {
  rateId: string;
  provider: string;
  service: string;
  amount: number;
  currency: string;
  shipmentId: string;
  status?: string; // e.g., "PENDING", "SHIPPED", "DELIVERED"
  trackingNumber?: string;
  labelUrl?: string;
}

export interface IOrder extends Document {
  reviewer: Types.ObjectId;
  bussiness: Types.ObjectId;
  shippingAddress: Types.ObjectId;
  items: IOrderItem[];
  totalQuantity: number;
  subTotal: number;
  deliveryFee: number; // same as shipping.amount
  totalPrice: number; // subtotal + deliveryFee
  paymentMethod: (typeof ENUM_PAYMENT_METHOD)[keyof typeof ENUM_PAYMENT_METHOD];
  paymentStatus: (typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
  deliveryStatus: (typeof ENUM_DELIVERY_STATUS)[keyof typeof ENUM_DELIVERY_STATUS];
  isReferralAmountPaid: boolean;
  shipping?: IShippingInfo; // ✅ new field for selected shipping rate
}
