import mongoose, { Schema } from 'mongoose';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';
import { IProduct } from './product.interface';

const ProductSchema = new Schema<IProduct>(
  {
    bussiness: {
      type: Schema.Types.ObjectId,
      ref: 'Bussiness',
      required: true,
    },
    name: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, required: false },
    status: {
      type: String,
      enum: Object.values(ENUM_PRODUCT_STATUS),
      default: ENUM_PRODUCT_STATUS.ACTIVE,
    },
    price: {
      type: Number,
      required: true,
    },
    images: { type: [String], required: false, default: [] },
    tags: { type: [String], required: false },
    colors: {
      type: [String],
    },
    sizes: {
      type: [String],
    },
    stock: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
