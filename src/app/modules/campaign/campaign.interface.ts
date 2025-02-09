import { Types } from 'mongoose';
import { ENUM_PAYMENT_METHOD, ENUM_PAYMENT_STATUS } from '../../utilities/enum';

export interface ICampaign {
  bussiness: Types.ObjectId;
  product: Types.ObjectId;
  name: string;
  amountForEachReview: number;
  numberOfReviewers: number;
  minAge: number;
  maxAge: number;
  startDate: Date;
  endDate: Date;
  gender: string;
  location: string;
  totalFee: number;
  paymentStatus: (typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
  paymentMethod: (typeof ENUM_PAYMENT_METHOD)[keyof typeof ENUM_PAYMENT_METHOD];
}
