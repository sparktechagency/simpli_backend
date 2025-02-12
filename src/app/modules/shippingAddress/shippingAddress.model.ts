import mongoose, { Schema } from 'mongoose';
import { IShippingAddress } from './shippingAddress.interface';

const shippingAddressSchema = new Schema({
  reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  alternativePhoneNumber: { type: String, required: true },
});

const ShippingAddress = mongoose.model<IShippingAddress>(
  'ShippingAddress',
  shippingAddressSchema,
);

export default ShippingAddress;
