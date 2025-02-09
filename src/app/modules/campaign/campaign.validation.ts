import { z } from 'zod';
import { Types } from 'mongoose';

export const createCampaignValidationSchema = z.object({
  body: z.object({
    product: z
      .string({ required_error: 'Product id is required' })
      .refine((val) => Types.ObjectId.isValid(val), {
        message: 'Invalid product ID',
      }),
    name: z
      .string({ required_error: 'Name is required' })
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be less than 100 characters'),
    amountForEachReview: z.number().min(0, 'Amount must be a positive number'),
    numberOfReviewers: z.number().min(1, 'There must be at least one reviewer'),
    minAge: z
      .number({ required_error: 'Min age is required' })
      .min(1, 'Min age musb be at least 1'),
    maxAge: z
      .number({ required_error: 'Max age is required' })
      .min(1, 'Max age must be at least 1'),
    startDate: z.preprocess(
      (arg) =>
        typeof arg === 'string' || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date().refine((date) => date >= new Date(), {
        message: 'Start date cannot be in the past',
      }),
    ),
    endDate: z.preprocess(
      (arg) =>
        typeof arg === 'string' || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date(),
    ),
    gender: z.enum(['male', 'female', 'other']),
    location: z.string().min(1, 'Location is required'),
  }),
});

const CampaignValidations = {
  createCampaignValidationSchema,
};

export default CampaignValidations;
