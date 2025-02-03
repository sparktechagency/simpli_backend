import mongoose, { Schema } from 'mongoose';
import { IStore } from './store.interface';

const StoreSchema: Schema = new Schema<IStore>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tagline: { type: String, required: false },
    description: { type: String, required: false },
    address: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  { timestamps: true },
);

export const Store = mongoose.model<IStore>('Store', StoreSchema);
