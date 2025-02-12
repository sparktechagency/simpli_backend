import { Types } from 'mongoose';

export interface IShippingAddress {
  reviewer: Types.ObjectId;
  address: string;
  country: string;
  zipCode: string;
  city: string;
  state: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
}
