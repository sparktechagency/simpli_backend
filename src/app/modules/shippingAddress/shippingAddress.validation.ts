import { z } from 'zod';

const shippingAddressValidationSchema = z.object({
  body: z.object({
    address: z.string({ required_error: 'Address is reqruied' }),
    country: z
      .string({ required_error: 'Country is required' })
      .min(1, 'Country is required'),
    zipCode: z
      .string({ required_error: 'Zip code is required' })
      .min(1, 'Zip code is required'),
    city: z
      .string({ required_error: 'City is required' })
      .min(1, 'City is required'),
    state: z
      .string({ required_error: 'State is required' })
      .min(1, 'State is required'),
    phoneNumber: z
      .string({ required_error: 'Phone number is required' })
      .min(1, 'Phone number is required'),
    alternativePhoneNumber: z
      .string({ required_error: 'Alternative phone number is reqruired' })
      .min(1, 'Alternative phone number is required'),
  }),
});
const updateShippingAddressValidationSchema = z.object({
  body: z.object({
    address: z.string({ required_error: 'Address is reqruied' }).optional(),
    country: z.string({ required_error: 'Country is required' }).optional(),
    zipCode: z.string({ required_error: 'Zip code is required' }).optional(),
    city: z.string({ required_error: 'City is required' }).optional(),
    state: z.string({ required_error: 'State is required' }).optional(),
    phoneNumber: z
      .string({ required_error: 'Phone number is required' })
      .optional(),
    alternativePhoneNumber: z
      .string({ required_error: 'Alternative phone number is reqruired' })
      .optional(),
  }),
});

const ShippingAddressValidations = {
  shippingAddressValidationSchema,
  updateShippingAddressValidationSchema,
};
export default ShippingAddressValidations;
