import { model, Schema } from 'mongoose';
import { IVariant } from './variant.interface';

const variantSchema = new Schema<IVariant>({
  bussiness: { type: Schema.Types.ObjectId, required: true },
  product: { type: Schema.Types.ObjectId, required: true },
  variantOption: { type: String, required: true },
  variantValue: { type: String, required: true },
  color: { type: String, required: false, default: '' },
  weight: { type: String, default: null },
  price: { type: Number, required: true },
  images: { type: [String], default: [] },
});

const Variant = model<IVariant>('Variant', variantSchema);

export default Variant;
