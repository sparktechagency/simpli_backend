import mongoose, { Schema } from 'mongoose';
import { IStore } from './store.interface';

const StoreSchema: Schema = new Schema<IStore>(
  {
    bussiness: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: { type: String, required: true },
    company: { type: String, required: true },
    street1: { type: String, required: true },
    street2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    zipCode: { type: Number },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    alternativePhoneNumber: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    tagline: { type: String },
    description: { type: String },
  },
  { timestamps: true },
);

export const Store = mongoose.model<IStore>('Store', StoreSchema);
