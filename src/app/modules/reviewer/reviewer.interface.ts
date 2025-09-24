import { Types } from 'mongoose';
import { GENDER, INTEREST_STATUS } from '../../utilities/enum';
import {
  educationLevel,
  employmentStatus,
  ethnicity,
  familyAndDependents,
  householdIncome,
  maritalStatus,
  receiveProductBy,
} from './reviewer.constant';

export interface IReviewer {
  user: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  city: string;
  zipcode: number;
  gender: (typeof GENDER)[keyof typeof GENDER];
  age: number;
  ethnicity: (typeof ethnicity)[keyof typeof ethnicity];
  educationLevel: (typeof educationLevel)[keyof typeof educationLevel];
  maritalStatus: (typeof maritalStatus)[keyof typeof maritalStatus];
  employmentStatus: (typeof employmentStatus)[keyof typeof employmentStatus];
  householdIncome: (typeof householdIncome)[keyof typeof householdIncome];
  familyAndDependents: (typeof familyAndDependents)[keyof typeof familyAndDependents];
  interestedCategory: [Types.ObjectId];
  currentlyShareReview: string[];
  interestedCategoryStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  currentShareReviewStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  shippingInformationStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  socailInfoStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  profileDetailStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  minPriceForReview: number | null;
  maxPriceForReview: number | null;
  receiveProductBy: (typeof receiveProductBy)[keyof typeof receiveProductBy];
  profile_image: string;
  bio: string;
  isPersonalInfoProvided: boolean;
  isAddressProvided: boolean;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  whatsapp: string;
  facebook: string;
  blog: string;
  followers: [Types.ObjectId];
  following: [Types.ObjectId];
  bussinessFollowing: [Types.ObjectId];
  reasonForLeaving: string;
  //
  totalEarning: number;
  currentBalance: number;

  // for stripe
  isStripeAccountConnected: { type: boolean; default: false };
  stripeConnectedAccountId: { type: string };
}
