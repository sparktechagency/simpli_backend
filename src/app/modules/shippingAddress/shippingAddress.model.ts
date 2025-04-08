import mongoose, { Schema } from 'mongoose';
import { IShippingAddress } from './shippingAddress.interface';

const shippingAddressSchema = new Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    alternativePhoneNumber: { type: String, required: true },
    street1: {
      type: String,
      required: true,
    },
    street2: {
      type: String,
    },
  },
  { timestamps: true },
);

const ShippingAddress = mongoose.model<IShippingAddress>(
  'ShippingAddress',
  shippingAddressSchema,
);

export default ShippingAddress;
