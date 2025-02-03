import { Types } from 'mongoose';

export interface IStore {
  bussiness: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  tagline: string;
  description: string;
  address: string;
  country: string;
  zipCode: number;
  city: string;
  state: string;
}
