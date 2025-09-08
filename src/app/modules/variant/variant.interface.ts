import { Types } from 'mongoose';

export interface IVariant {
  bussiness: Types.ObjectId;
  product: Types.ObjectId;
  color?: string;
  weight?: string;
  price: number;
  variantOption: string;
  variantValue: string;
  images?: string[];
  newImages?: string[];
  deletedImages?: string[];
}
