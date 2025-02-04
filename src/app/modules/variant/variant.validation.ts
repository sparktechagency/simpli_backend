import { z } from 'zod';

export const createVariantValidationSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  color: z.string().optional(),
  size: z.string().optional(),
  weight: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().min(0, 'Stock cannot be negative').default(0),
  images: z.array(z.string().url('Invalid image URL')).optional(),
});

const VariantValidations = {
  createVariantValidationSchema,
};

export default VariantValidations;
