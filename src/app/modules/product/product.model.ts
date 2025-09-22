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
    name: { type: String },
    shortDescription: { type: String, default: '' },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: String },
    status: {
      type: String,
      enum: Object.values(ENUM_PRODUCT_STATUS),
      default: ENUM_PRODUCT_STATUS.ACTIVE,
    },
    price: {
      type: Number,
    },
    images: { type: [String], default: [] },
    tags: { type: [String] },
    colors: {
      type: [String],
    },
    sizes: {
      type: [String],
    },
    stock: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // for shipping
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    width: {
      type: Number,
    },
    length: {
      type: Number,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
