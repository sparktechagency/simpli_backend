import { Types } from 'mongoose';
import { z } from 'zod';

// Helper function to validate MongoDB ObjectId
const ObjectIdSchema = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .min(1, `${fieldName} cannot be empty`)
    .refine((val) => Types.ObjectId.isValid(val), {
      message: `${fieldName} must be a valid ObjectId`,
    });

const reviewValidationSchema = z.object({
  body: z.object({
    campaignOfferId: ObjectIdSchema('Campaign Offer ID'),
    description: z.string({ required_error: 'Description is required' }),
    rating: z
      .number({
        required_error: 'Rating is required',
        invalid_type_error: 'Rating must be number',
      })
      .min(1, { message: 'Rating at list 1' })
      .max(5, { message: 'Max rating will be 5' }),
  }),
});

const ReviewValidation = {
  reviewValidationSchema,
};

export default ReviewValidation;
