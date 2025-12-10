import mongoose, { Schema } from 'mongoose';
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
import { IReviewer } from './reviewer.interface';

const ReviewerSchema: Schema = new Schema<IReviewer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zipcode: { type: String, default: '' },
    gender: { type: String, enum: Object.values(GENDER) },
    age: { type: Number },
    ethnicity: { type: String, enum: Object.values(ethnicity) },
    educationLevel: { type: String, enum: Object.values(educationLevel) },
    maritalStatus: { type: String, enum: Object.values(maritalStatus) },
    employmentStatus: { type: String, enum: Object.values(employmentStatus) },
    householdIncome: { type: String, enum: Object.values(householdIncome) },
    familyAndDependents: {
      type: String,
      enum: Object.values(familyAndDependents),
    },

    interestedCategory: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
    },
    currentlyShareReview: [String],
    interestedCategoryStatus: {
      type: String,
      enum: Object.values(INTEREST_STATUS),
      default: INTEREST_STATUS.IN_PROGRESS,
    },
    currentShareReviewStatus: {
      type: String,
      enum: Object.values(INTEREST_STATUS),
      default: INTEREST_STATUS.IN_PROGRESS,
    },
    shippingInformationStatus: {
      type: String,
      enum: Object.values(INTEREST_STATUS),
      default: INTEREST_STATUS.IN_PROGRESS,
    },
    socailInfoStatus: {
      type: String,
      enum: Object.values(INTEREST_STATUS),
      default: INTEREST_STATUS.IN_PROGRESS,
    },
    profileDetailStatus: {
      type: String,
      enum: Object.values(INTEREST_STATUS),
      default: INTEREST_STATUS.IN_PROGRESS,
    },
    receiveProductBy: {
      type: String,
      enum: Object.values(receiveProductBy),
    },
    minPriceForReview: {
      type: Number,
      default: null,
    },
    maxPriceForReview: {
      type: Number,
      default: null,
    },
    isPersonalInfoProvided: {
      type: Boolean,
      default: false,
    },
    isAddressProvided: {
      type: Boolean,
      default: false,
    },
    profile_image: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
    },
    instagram: {
      type: String,
      default: '',
    },
    youtube: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
    tiktok: {
      type: String,
      default: '',
    },
    whatsapp: {
      type: String,
      default: '',
    },
    facebook: {
      type: String,
      default: '',
    },
    blog: String,

    //
    totalEarning: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    // for stripe
    isStripeAccountConnected: { type: Boolean, default: false },
    stripeConnectedAccountId: { type: String },

    // delete
    reasonForLeaving: { type: String, default: '' },
  },
  { timestamps: true },
);

const Reviewer = mongoose.model<IReviewer>('Reviewer', ReviewerSchema);

export default Reviewer;
