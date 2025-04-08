import { Types } from 'mongoose';

export interface IShippingAddress {
  reviewer: Types.ObjectId;
  name: string;
  address: string;
  country: string;
  zipCode: string;
  city: string;
  state: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  street1: string;
  street2?: string;
  email: string;
}
