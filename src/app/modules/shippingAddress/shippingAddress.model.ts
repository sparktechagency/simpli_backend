import mongoose, { Schema } from 'mongoose';
import { IShippingAddress } from './shippingAddress.interface';

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
    name: { type: String, required: true },
    company: { type: String },
    country: { type: String, required: true },
    zip: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    alternativePhoneNumber: { type: String },
    street1: {
      type: String,
      required: true,
    },
    street2: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const ShippingAddress = mongoose.model<IShippingAddress>(
  'ShippingAddress',
  shippingAddressSchema,
);

export default ShippingAddress;
