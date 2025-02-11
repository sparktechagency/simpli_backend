import mongoose, { Schema } from 'mongoose';
import { IReviewer } from './reviewer.interface';
import { GENDER, INTEREST_STATUS } from '../../utilities/enum';

const ReviewerSchema: Schema = new Schema<IReviewer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    city: { type: String },
    zipcode: { type: Number },
    gender: { type: String, enum: Object.values(GENDER) },
    age: { type: Number },
    interestedProductStatus: {
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
    isProfileInfoProvided: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Reviewer = mongoose.model<IReviewer>('Reviewer', ReviewerSchema);

export default Reviewer;
