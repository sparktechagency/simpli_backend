import { z } from 'zod';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';

export const createVariantValidationSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  color: z.string().optional(),
  size: z.string().optional(),
  weight: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().min(0, 'Stock cannot be negative').default(0),
  images: z.array(z.string()).optional(),
});

const ProductStatusSchema = z.nativeEnum(ENUM_PRODUCT_STATUS);

export const createProductValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Product name is required' })
        .min(3, 'Product name must be at least 3 characters long'),
      description: z
        .string({ required_error: 'Description is required' })
        .min(10, 'Description must be at least 10 characters'),
      category: z
        .string({ required_error: 'Category is required' })
        .min(1, 'Category ID is required'),
      brand: z.string().optional(),
      status: ProductStatusSchema.default(ENUM_PRODUCT_STATUS.ACTIVE),
      // variants: z
      //   .array(createVariantValidationSchema, {
      //     required_error: 'At least one variant is required',
      //   })
      //   .min(1, 'At least one variant is required'),
      tags: z.array(z.string().min(1)).optional(),
      weight: z
        .number()
        .min(0.1, { message: 'Weight minimum 0.1 lb is required' })
        .max(150, { message: 'Weight maximum 150 lb is allowed' }),
      length: z
        .number()
        .min(1, { message: 'Length minimum 1 inch is required' })
        .max(48, { message: 'Length maximum 48 inches is allowed' }),
      width: z
        .number()
        .min(1, { message: 'Width minimum 1 inch is required' })
        .max(36, { message: 'Width maximum 36 inches is allowed' }),
      height: z
        .number()
        .min(1, { message: 'Height minimum 1 inch is required' })
        .max(36, { message: 'Height maximum 36 inches is allowed' }),
    })
    .refine((data) => data.length + 2 * (data.width + data.height) <= 165, {
      message: 'Length + girth (2*(width+height)) cannot exceed 165 inches',
    }),
});

const changeProductStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(ENUM_PRODUCT_STATUS) as [string, ...string[]]),
  }),
});
const saveAsDraftProductValidationSchema = z.object({
  body: z
    .object({
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
      // variants: z
      //   .array(variantSchema)
      //   .min(1, 'At least one variant is required')
      //   .optional(),
      tags: z.array(z.string().min(1)).optional(),

      // Optional shipping/dimensions fields
      weight: z
        .number()
        .min(0.1, { message: 'Weight minimum 0.1 lb is required' })
        .max(150, { message: 'Weight maximum 150 lb is allowed' })
        .optional(),
      length: z
        .number()
        .min(1, { message: 'Length minimum 1 inch is required' })
        .max(48, { message: 'Length maximum 48 inches is allowed' })
        .optional(),
      width: z
        .number()
        .min(1, { message: 'Width minimum 1 inch is required' })
        .max(36, { message: 'Width maximum 36 inches is allowed' })
        .optional(),
      height: z
        .number()
        .min(1, { message: 'Height minimum 1 inch is required' })
        .max(36, { message: 'Height maximum 36 inches is allowed' })
        .optional(),
    })
    .refine(
      (data) =>
        !data.length ||
        !data.width ||
        !data.height ||
        data.length + 2 * (data.width + data.height) <= 165,
      { message: 'Length + girth (2*(width+height)) cannot exceed 165 inches' },
    ),
});

const updateProductValidationSchema = z.object({
  body: z
    .object({
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
      status: ProductStatusSchema.optional(),
      tags: z.array(z.string().min(1)).optional(),

      // Optional shipping/dimensions fields
      weight: z
        .number()
        .min(0.1, { message: 'Weight minimum 0.1 lb is required' })
        .max(150, { message: 'Weight maximum 150 lb is allowed' })
        .optional(),
      length: z
        .number()
        .min(1, { message: 'Length minimum 1 inch is required' })
        .max(48, { message: 'Length maximum 48 inches is allowed' })
        .optional(),
      width: z
        .number()
        .min(1, { message: 'Width minimum 1 inch is required' })
        .max(36, { message: 'Width maximum 36 inches is allowed' })
        .optional(),
      height: z
        .number()
        .min(1, { message: 'Height minimum 1 inch is required' })
        .max(36, { message: 'Height maximum 36 inches is allowed' })
        .optional(),
    })
    .refine(
      (data) =>
        // Only validate length + girth if all dimensions are provided
        !data.length ||
        !data.width ||
        !data.height ||
        data.length + 2 * (data.width + data.height) <= 165,
      { message: 'Length + girth (2*(width+height)) cannot exceed 165 inches' },
    ),
});

const ProductValidations = {
  createProductValidationSchema,
  saveAsDraftProductValidationSchema,
  changeProductStatusValidationSchema,
  updateProductValidationSchema,
};

export default ProductValidations;
