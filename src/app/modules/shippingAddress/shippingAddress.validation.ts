import { z } from 'zod';

const shippingAddressValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required'),
    company: z
      .string({ required_error: 'Company is required' })
      .min(1, 'Company is required'),
    country: z
      .string({ required_error: 'Country is required' })
      .min(1, 'Country is required'),
    zip: z
      .string({ required_error: 'Zip is required' })
      .min(1, 'Zip is required'),
    city: z
      .string({ required_error: 'City is required' })
      .min(1, 'City is required'),
    state: z
      .string({ required_error: 'State is required' })
      .min(1, 'State is required'),
    phone: z
      .string({ required_error: 'Phone is required' })
      .min(1, 'Phone is required'),
    email: z.string().email('Invalid email address').optional(),
    alternativePhoneNumber: z
      .string({ required_error: 'Alternative phone number is required' })
      .min(1, 'Alternative phone number is required'),
    street1: z
      .string({ required_error: 'Street1 is required' })
      .min(1, 'Street1 is required'),
    street2: z.string().optional(),
  }),
});

const updateShippingAddressValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).optional(),
    company: z.string({ required_error: 'Company is required' }).optional(),
    country: z.string({ required_error: 'Country is required' }).optional(),
    zip: z.string({ required_error: 'Zip is required' }).optional(),
    city: z.string({ required_error: 'City is required' }).optional(),
    state: z.string({ required_error: 'State is required' }).optional(),
    phone: z.string({ required_error: 'Phone is required' }).optional(),
    email: z.string().email('Invalid email address').optional(),
    alternativePhoneNumber: z
      .string({ required_error: 'Alternative phone number is required' })
      .optional(),
    street1: z.string({ required_error: 'Street1 is required' }).optional(),
    street2: z.string().optional(),
  }),
});

const ShippingAddressValidations = {
  shippingAddressValidationSchema,
  updateShippingAddressValidationSchema,
};

export default ShippingAddressValidations;
