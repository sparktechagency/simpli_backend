import mongoose, { Schema } from 'mongoose';
import { IReviewer } from './reviewer.interface';
import { GENDER } from '../../utilities/enum';

const ReviewerSchema: Schema = new Schema<IReviewer>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    zipcode: { type: Number, required: true },
    gender: { type: String, enum: Object.values(GENDER), required: true },
    age: { type: Number, required: true },
    isStripeAccountConnected: { type: Boolean, default: false },
    stripeConnectedAccountId: { type: String },
  },
  { timestamps: true },
);

const Reviewer = mongoose.model<IReviewer>('Reviewer', ReviewerSchema);

export default Reviewer;
