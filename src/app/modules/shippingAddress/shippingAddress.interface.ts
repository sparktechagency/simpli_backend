import { Types } from 'mongoose';

export interface IShippingAddress {
  reviewer: Types.ObjectId;
  name: string;
  company: string;
  street1: string;
  zip: string;
  city: string;
  country: string;
  state: string;
  phone: string;
  alternativePhoneNumber: string;
  street2?: string;
  email: string;
  isDeleted: boolean;
}
