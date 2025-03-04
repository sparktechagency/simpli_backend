import { model, Schema } from 'mongoose';
import { IReferralSales } from './referralSales.interface';

const referralSalesSchema = new Schema<IReferralSales>({
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'Reviewer',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  bussiness: {
    type: Schema.Types.ObjectId,
    ref: 'Bussiness',
  },
  commision: {
    type: Number,
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'Reviewer',
    required: true,
  },
});

const ReferralSales = model('ReferralSales', referralSalesSchema);

export default ReferralSales;
