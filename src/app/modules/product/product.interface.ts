import { Types } from 'mongoose';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';

export interface IVariant {
  sku: string;
  color?: string;
  size?: string;
  weight?: string;
  price: number;
  stock: number;
  images?: string[];
}

export interface IProduct {
  bussiness: Types.ObjectId;
  name: string;
  description: string;
  category: Types.ObjectId;
  brand?: string;
  status: (typeof ENUM_PRODUCT_STATUS)[keyof typeof ENUM_PRODUCT_STATUS];
  variants: IVariant[];
  images?: string[];
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isDraft: boolean;
}
