import { model, Schema } from 'mongoose';
import { IVariant } from './variant.interface';

const variantSchema = new Schema<IVariant>({
  bussiness: { type: Schema.Types.ObjectId, required: true },
  product: { type: Schema.Types.ObjectId, required: true },
  sku: { type: String, unique: true, required: true },
  color: { type: String, required: false, default: '' },
  sizes: {
    type: [String],
    default: [],
  },
  weight: { type: String, default: null },
  height: { type: String, default: null },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: { type: [String], default: [] },
});

const Variant = model<IVariant>('Variant', variantSchema);

export default Variant;
