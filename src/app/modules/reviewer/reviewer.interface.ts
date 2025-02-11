import { Types } from 'mongoose';
import { GENDER, INTEREST_STATUS } from '../../utilities/enum';

export interface IReviewer {
  user: Types.ObjectId;
  name: string;
  username: string;
  city: string;
  zipcode: number;
  gender: (typeof GENDER)[keyof typeof GENDER];
  age: number;
  interestedProductStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  currentShareReviewStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  shippingInformationStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  socailInfoStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  profileDetailStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  isProfileInfoProvided: boolean;
}
