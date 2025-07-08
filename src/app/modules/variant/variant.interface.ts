import { Types } from 'mongoose';

export interface IVariant {
  bussiness: Types.ObjectId;
  product: Types.ObjectId;
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  price: number;
  stock: number;
  images?: string[];
  newImages?: string[];
  deletedImages?: string[];
}
