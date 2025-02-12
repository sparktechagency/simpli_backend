import { Types } from 'mongoose';
import { GENDER, INTEREST_STATUS } from '../../utilities/enum';
import {
  educationLevel,
  employmentStatus,
  ethnicity,
  familyAndDependents,
  householdIncome,
  maritalStatus,
} from './reviewer.constant';

export interface IReviewer {
  user: Types.ObjectId;
  name: string;
  username: string;
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
  interestedCategoryStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  currentShareReviewStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  shippingInformationStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  socailInfoStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  profileDetailStatus: (typeof INTEREST_STATUS)[keyof typeof INTEREST_STATUS];
  isPersonalInfoProvided: boolean;
  isAddressProvided: boolean;
}
