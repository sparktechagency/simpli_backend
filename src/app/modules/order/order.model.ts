import { model, Schema } from 'mongoose';
import { IOrder, IOrderItem } from './order.interface';
import {
  ENUM_DELIVERY_STATUS,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';

const OrderItemSchema: Schema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: Schema.Types.ObjectId, ref: 'Variant', default: null },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  referral: {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'Reviewer',
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
    amount: {
      type: Number,
    },
  },
});

const OrderSchema: Schema = new Schema<IOrder>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
    bussiness: {
      type: Schema.Types.ObjectId,
      ref: 'Bussiness',
      required: true,
    },
    shippingAddress: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ShippingAddress',
    },
    items: { type: [OrderItemSchema], required: true },
    totalQuantity: { type: Number, required: true, min: 1 },
    subTotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_METHOD) as string[],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_STATUS) as string[],
      default: ENUM_PAYMENT_STATUS.PENDING,
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: Object.values(ENUM_DELIVERY_STATUS) as string[],
      default: ENUM_DELIVERY_STATUS.waiting,
      required: true,
    },
    isReferralAmountPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Order = model<IOrder>('Order', OrderSchema);
