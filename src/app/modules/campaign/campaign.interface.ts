import { Types } from 'mongoose';

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
}
