import { Types } from 'mongoose';
import {
  CAMPAIGN_STATUS,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';
import { ENUM_REVIEW_TYPE } from './campaign.enum';

export interface ICampaign {
  bussiness: Types.ObjectId;
  product: Types.ObjectId;
  name: string;
  amountForEachReview: number;
  numberOfReviewers: number;
  totalBugget: number;
  minAge: number;
  maxAge: number;
  startDate: Date;
  endDate: Date;
  gender: string;
  location: string;
  city: string[];
  country: string;
  state: string[];
  isShowEverywhere: boolean;
  totalFee: number;
  paymentStatus: (typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
  paymentMethod: (typeof ENUM_PAYMENT_METHOD)[keyof typeof ENUM_PAYMENT_METHOD];
  status: (typeof CAMPAIGN_STATUS)[keyof typeof CAMPAIGN_STATUS];
  reviewType: (typeof ENUM_REVIEW_TYPE)[keyof typeof ENUM_REVIEW_TYPE];
  paymentIntentId: string;
}

export type CampaignSummary = {
  id: string;
  name: string;
  timeline: { startDate: string; endDate: string };
  budget: { spent: number; total: number; remaining: number };
  status: string;
  progress: { completed: number; target: number; percent: number };
  totals: {
    reviewsCompleted: number;
    totalSpent: number;
    averageRating: number | null;
  };
  daysRemaining: number;
};
