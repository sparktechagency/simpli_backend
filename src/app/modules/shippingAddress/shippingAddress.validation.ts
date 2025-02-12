import { z } from 'zod';

const shippingAddressValidationSchema = z.object({
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
});

const ShippingAddressValidations = {
  shippingAddressValidationSchema,
};
export default ShippingAddressValidations;
