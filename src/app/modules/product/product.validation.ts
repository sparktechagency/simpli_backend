import { z } from 'zod';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';

const ProductStatusSchema = z.nativeEnum(ENUM_PRODUCT_STATUS);

export const createProductValidationSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category ID is required'),
  brand: z.string().optional(),
  status: ProductStatusSchema.default(ENUM_PRODUCT_STATUS.ACTIVE),
  //   variants: z.array(variantSchema).min(1, 'At least one variant is required'),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

const saveAsDraftProductValidationSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters long')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .optional(),
  category: z.string().min(1, 'Category ID is required').optional(),
  brand: z.string().optional(),
  status: ProductStatusSchema.default(ENUM_PRODUCT_STATUS.ACTIVE),
  //   variants: z
  //     .array(variantSchema)
  //     .min(1, 'At least one variant is required')
  //     .optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

const ProductValidations = {
  createProductValidationSchema,
  saveAsDraftProductValidationSchema,
};

export default ProductValidations;
