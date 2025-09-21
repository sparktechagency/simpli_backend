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
const campaignOfferSchema = z.object({
  body: z.object({
    campaign: ObjectIdSchema('Campaign ID'),
    product: ObjectIdSchema('Product ID'),
    business: ObjectIdSchema('Business ID'),
    shippingAddress: ObjectIdSchema('Shipping Address ID'),
  }),
});

const proceedDeliveryForCampaignOfferValidationSchema = z.object({
  body: z.object({
    paymentMethod: z.string({ required_error: 'Payment method is required' }),
    shipmentId: z.string({ required_error: 'Shipment id is required' }),
    selectedRateId: z.string({
      required_error: 'Selected rated id is required',
    }),
    campaignOfferId: z.string({
      required_error: 'Campaign offer id is required',
    }),
  }),
});
const CampaignOfferValidations = {
  campaignOfferSchema,
  proceedDeliveryForCampaignOfferValidationSchema,
};

export default CampaignOfferValidations;
