import { Types } from 'mongoose';

export interface IStore {
  bussiness: Types.ObjectId;
  name: string;
  company: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  alternativePhoneNumber: string;
  email?: string;
  tagline?: string;
  description?: string;
}
