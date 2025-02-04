import { model, Schema } from 'mongoose';
import { IVariant } from './variant.interface';

const variantSchema = new Schema<IVariant>({
  product: { type: Schema.Types.ObjectId, required: true },
  sku: { type: String, unique: true, required: true },
  color: { type: String, required: false },
  size: { type: String, required: false },
  weight: { type: String, required: false },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: { type: [String], required: false },
});

const Variant = model<IVariant>('Variant', variantSchema);

export default Variant;
