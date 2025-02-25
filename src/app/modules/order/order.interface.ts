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
}

export interface IOrder extends Document {
  reviewer: Types.ObjectId;
  bussiness: Types.ObjectId;
  shippingAddress: Types.ObjectId;
  items: IOrderItem[];
  totalQuantity: number;
  subTotal: number;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: (typeof ENUM_PAYMENT_METHOD)[keyof typeof ENUM_PAYMENT_METHOD];
  paymentStatus: (typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
  deliveryStatus: (typeof ENUM_DELIVERY_STATUS)[keyof typeof ENUM_DELIVERY_STATUS];
}
