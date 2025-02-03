import mongoose, { Schema } from 'mongoose';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';
import { IProduct, IVariant } from './product.interface';

const VariantSchema = new Schema<IVariant>({
  //   sku: { type: String, unique: true, required: true },
  color: { type: String, required: false },
  size: { type: String, required: false },
  weight: { type: String, required: false },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: { type: [String], required: false },
});

const ProductSchema = new Schema<IProduct>(
  {
    bussiness: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, required: false },
    status: {
      type: String,
      enum: Object.values(ENUM_PRODUCT_STATUS),
      default: ENUM_PRODUCT_STATUS.ACTIVE,
    },
    variants: { type: [VariantSchema], required: true },
    images: { type: [String], required: false },
    tags: { type: [String], required: false },
  },
  { timestamps: true },
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
