import { z } from 'zod';
import { Types } from 'mongoose';
import { CampaignOfferStatus } from './campaignOffer.constant';
import { ENUM_DELIVERY_STATUS } from '../../utilities/enum';

// Helper function to validate MongoDB ObjectId
const ObjectIdSchema = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .min(1, `${fieldName} cannot be empty`)
    .refine((val) => Types.ObjectId.isValid(val), {
      message: `${fieldName} must be a valid ObjectId`,
    });
const campaignOfferSchema = z.object({
  campaign: ObjectIdSchema('Campaign ID'),
  product: ObjectIdSchema('Product ID'),
  business: ObjectIdSchema('Business ID'),
  reviewer: ObjectIdSchema('Reviewer ID'),
  shippingAddress: ObjectIdSchema('Shipping Address ID'),
  status: z.enum(Object.values(CampaignOfferStatus) as [string, ...string[]]),
  deliveryStatus: z.enum(
    Object.values(ENUM_DELIVERY_STATUS) as [string, ...string[]],
  ),
  amount: z.number().positive('Amount must be a positive number'),
});

const CampaignOfferValidations = {
  campaignOfferSchema,
};

export default CampaignOfferValidations;
