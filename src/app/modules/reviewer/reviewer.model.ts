import mongoose, { Schema } from 'mongoose';
import { IReviewer } from './reviewer.interface';
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

const ReviewerSchema: Schema = new Schema<IReviewer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    city: { type: String },
    zipcode: { type: Number },
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
    instagram: String,
    youtube: String,
    twitter: String,
    tiktok: String,
    whatsapp: String,
    facebook: String,
    blog: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reviewer' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reviewer' }],
  },
  { timestamps: true },
);

const Reviewer = mongoose.model<IReviewer>('Reviewer', ReviewerSchema);

export default Reviewer;
