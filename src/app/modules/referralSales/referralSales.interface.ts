import { Types } from 'mongoose';

export interface IReferralSales {
  review: Types.ObjectId;
  reviewer: Types.ObjectId;
  product: Types.ObjectId;
  commision: number;
  buyer: Types.ObjectId;
}
