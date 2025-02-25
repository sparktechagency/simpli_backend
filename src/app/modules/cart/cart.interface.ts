import { Document, Types } from 'mongoose';

export interface ICartItem {
  product: Types.ObjectId;
  variant: Types.ObjectId | null;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  reviewer: Types.ObjectId;
  bussiness: Types.ObjectId;
  items: ICartItem[];
  totalQuantity: number;
  subTotal: number;
  deliveryFee: number;
  totalPrice: number;
}
