import { z } from 'zod';
import { ENUM_RETURN_METHOD, ENUM_RETURN_STATUS } from './return.enum';
import mongoose from 'mongoose';

const OrderItemZodSchema = z.object({
  product: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid product ID format',
  }),
  variant: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').int(),
  price: z.number().min(0, 'Price must be a positive number'),
  referral: z
    .object({
      reviewerId: z.string().optional(),
      reviewId: z.string().optional(),
      amount: z.number().optional().nullable(),
    })
    .optional(),
});

const returnValidationSchema = z.object({
  body: z.object({
    business: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid business ID format',
    }),
    reviewer: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid reviewer ID format',
    }),
    items: z.array(OrderItemZodSchema).nonempty('Items array cannot be empty'),
    orderId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid order ID format',
    }),
    transactionId: z.string().nonempty('Transaction ID is required'),
    totalReturnAmount: z.number().optional(),
    returnMethod: z.enum(
      Object.values(ENUM_RETURN_METHOD) as [string, ...string[]],
    ),
    status: z.enum(Object.values(ENUM_RETURN_STATUS) as [string, ...string[]]),
    refundTransactionId: z.string().nullable().optional(),
    refundDate: z.date().nullable().optional(),
  }),
});

export const returnValidations = {
  returnValidationSchema,
};
