import { Types } from 'mongoose';
import { z } from 'zod';
import { CAMPAIGN_STATUS, ENUM_PAYMENT_METHOD } from '../../utilities/enum';

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
    // amountForEachReview: z.number().min(0, 'Amount must be a positive number'),
    numberOfReviewers: z.number().min(1, 'There must be at least one reviewer'),
    minAge: z
      .number({ required_error: 'Min age is required' })
      .min(1, 'Min age musb be at least 1'),
    maxAge: z
      .number({ required_error: 'Max age is required' })
      .min(1, 'Max age must be at least 1'),
    // startDate: z.preprocess(
    //   (arg) =>
    //     typeof arg === 'string' || arg instanceof Date
    //       ? new Date(arg)
    //       : undefined,
    //   z.date().refine(
    //     (date) => {
    //       const today = new Date();
    //       today.setHours(0, 0, 0, 0); // normalize today's date to 00:00:00
    //       return date >= today;
    //     },
    //     {
    //       message: 'Start date cannot be in the past',
    //     },
    //   ),
    // ),
    startDate: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          const date = new Date(arg);
          date.setHours(0, 0, 0, 0); // 🔥 normalize input
          return date;
        }
        return undefined;
      },
      z.date().refine(
        (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // normalize today
          return date >= today; // allow today + future
        },
        {
          message: 'Start date cannot be in the past',
        },
      ),
    ),
    endDate: z.preprocess(
      (arg) =>
        typeof arg === 'string' || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date(),
    ),
    gender: z.enum(['male', 'female', 'both', 'other']),
    // location: z.string().min(1, 'Location is required'),
    paymentMethod: z.enum(
      Object.values(ENUM_PAYMENT_METHOD) as [string, ...string[]],
    ),
  }),
});

export const updateCampaignValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).optional(),
    minAge: z.number().optional(),
    maxAge: z.number().optional(),
    startDate: z
      .preprocess(
        (arg) =>
          typeof arg === 'string' || arg instanceof Date
            ? new Date(arg)
            : undefined,
        z.date().refine((date) => date >= new Date(), {
          message: 'Start date cannot be in the past',
        }),
      )
      .optional(),
    endDate: z
      .preprocess(
        (arg) =>
          typeof arg === 'string' || arg instanceof Date
            ? new Date(arg)
            : undefined,
        z.date(),
      )
      .optional(),
    gender: z.enum(['male', 'female', 'other']),
    // location: z.string().min(1, 'Location is required'),
  }),
});

const changeCampaignStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(CAMPAIGN_STATUS) as [string, ...string[]]),
  }),
});

const CampaignValidations = {
  createCampaignValidationSchema,
  changeCampaignStatusValidationSchema,
  updateCampaignValidationSchema,
};

export default CampaignValidations;
