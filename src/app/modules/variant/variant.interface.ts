import { Types } from 'mongoose';

export interface IVariant {
  product: Types.ObjectId;
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  price: number;
  stock: number;
  images?: string[];
}
