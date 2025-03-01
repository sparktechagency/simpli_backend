import { Types } from 'mongoose';

export interface IReview {
  reviewer: Types.ObjectId;
  product: Types.ObjectId;
  category: Types.ObjectId;
  campaign: Types.ObjectId;
  amount: number;
  description: string;
  images: string[];
  video: string;
  thumbnail: string;
  liker: [Types.ObjectId];
  comments: [Types.ObjectId];
}
