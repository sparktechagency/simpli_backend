import { z } from 'zod';

export const createVariantValidationSchema = z.object({
  body: z.object({
    // sku: z.string().min(1, 'SKU is required'),
    color: z.string().optional(),
    size: z.string().optional(),
    weight: z.string().optional(),

    price: z.number().positive('Price must be greater than zero'),
    // stock: z.number().min(0, 'Stock cannot be negative').default(0),
    variantOption: z.string({ required_error: 'Variant option is required' }),
    variantValue: z.string({ required_error: 'Variant value is required' }),
    images: z.array(z.string()).optional(),
  }),
});
export const updateVariantValidationSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'SKU is required').optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    weight: z.string().optional(),
    price: z.number().positive('Price must be greater than zero').optional(),
    // stock: z.number().min(0, 'Stock cannot be negative').default(0),
    images: z.array(z.string()).optional(),
  }),
});

const VariantValidations = {
  createVariantValidationSchema,
  updateVariantValidationSchema,
};

export default VariantValidations;
