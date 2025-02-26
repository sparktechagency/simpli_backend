import { z } from 'zod';
import { Types } from 'mongoose';

// Helper function to validate MongoDB ObjectId
const ObjectIdSchema = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .min(1, `${fieldName} cannot be empty`)
    .refine((val) => Types.ObjectId.isValid(val), {
      message: `${fieldName} must be a valid ObjectId`,
    });
const campaignOfferSchema = z.object({
  body: z.object({
    campaign: ObjectIdSchema('Campaign ID'),
    product: ObjectIdSchema('Product ID'),
    business: ObjectIdSchema('Business ID'),
    shippingAddress: ObjectIdSchema('Shipping Address ID'),
    amount: z.number().positive('Amount must be a positive number'),
  }),
});

const CampaignOfferValidations = {
  campaignOfferSchema,
};

export default CampaignOfferValidations;
