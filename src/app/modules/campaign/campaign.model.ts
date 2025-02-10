import { Schema, model } from 'mongoose';
import { ICampaign } from './campaign.interface';
import {
  CAMPAIGN_STATUS,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';

const CampaignSchema = new Schema<ICampaign>(
  {
    bussiness: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    amountForEachReview: {
      type: Number,
      required: true,
      min: 0,
    },
    numberOfReviewers: {
      type: Number,
      required: true,
      min: 1,
    },
    minAge: {
      type: Number,
      required: true,
      min: 1,
    },
    maxAge: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    totalFee: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_METHOD),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_STATUS),
      default: ENUM_PAYMENT_STATUS.PENDING,
    },
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_STATUS),
      default: CAMPAIGN_STATUS.ACTIVE,
    },
    paymentIntentId: {
      type: String,
    },
    totalBugget: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Campaign = model<ICampaign>('Campaign', CampaignSchema);
export default Campaign;
