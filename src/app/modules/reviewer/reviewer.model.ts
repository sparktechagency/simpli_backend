import mongoose, { Schema } from 'mongoose';
import { IReviewer } from './reviewer.interface';
import { GENDER, INTEREST_STATUS } from '../../utilities/enum';

const ReviewerSchema: Schema = new Schema<IReviewer>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    zipcode: { type: Number, required: true },
    gender: { type: String, enum: Object.values(GENDER), required: true },
    age: { type: Number, required: true },
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
  },
  { timestamps: true },
);

const Reviewer = mongoose.model<IReviewer>('Reviewer', ReviewerSchema);

export default Reviewer;
