import mongoose, { Schema, Types } from 'mongoose';
import { IReview } from './review.interface';

const ReviewSchema = new Schema<IReview>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    video: { type: String, required: true },
    thumbnail: { type: String, required: true },
    liker: [{ type: Types.ObjectId, ref: 'User', default: [] }],
    comments: [{ type: Types.ObjectId, ref: 'Comment', default: [] }],
  },
  {
    timestamps: true,
  },
);

const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
