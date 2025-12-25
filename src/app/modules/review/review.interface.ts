import { Types } from 'mongoose';

export interface IReview {
  reviewer: Types.ObjectId;
  product: Types.ObjectId;
  business: Types.ObjectId;
  category: Types.ObjectId;
  campaign: Types.ObjectId;
  amount: number;
  description: string;
  images: string[];
  video: string;
  thumbnail: string;
  likers: [Types.ObjectId];
  comments: [Types.ObjectId];
  rating: number;
  totalView: number;
  totalReferralSales: number;
  totalCommissions: number;
  videoId: string;
  isReady: boolean;
}
