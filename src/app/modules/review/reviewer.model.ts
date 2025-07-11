import mongoose, { Schema, Types } from 'mongoose';
import { IReview } from './review.interface';

const ReviewSchema = new Schema<IReview>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    images: { type: [String] },
    video: { type: String },
    thumbnail: { type: String },
    likers: [{ type: Types.ObjectId, ref: 'Reviewer', default: [] }],
    // comments: [{ type: Types.ObjectId, ref: 'Comment', default: [] }],
    rating: { type: Number, required: true },
    totalView: {
      type: Number,
      default: 0,
    },
    totalCommissions: {
      type: Number,
      default: 0,
    },
    totalReferralSales: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

ReviewSchema.index({ reviewer: 1, createdAt: -1 });
ReviewSchema.index({ likers: 1 });

const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
