import { z } from 'zod';

const createStoreValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required'),
    company: z
      .string({ required_error: 'Company is required' })
      .min(1, 'Company is required'),
    street1: z
      .string({ required_error: 'Street1 is required' })
      .min(1, 'Street1 is required'),
    street2: z.string().optional(),
    city: z
      .string({ required_error: 'City is required' })
      .min(1, 'City is required'),
    state: z
      .string({ required_error: 'State is required' })
      .min(1, 'State is required'),
    zip: z
      .string({ required_error: 'ZIP is required' })
      .min(1, 'ZIP is required'),
    zipCode: z.number().int().positive('Invalid zip code').optional(),
    country: z
      .string({ required_error: 'Country is required' })
      .min(1, 'Country is required'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(10, 'Phone number is required'),
    alternativePhoneNumber: z
      .string({ required_error: 'Alternative phone number is required' })
      .min(10, 'Alternative phone number is required'),
    email: z.string().email('Invalid email format').optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
  }),
});

const updateStoreValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required')
      .optional(),
    company: z
      .string({ required_error: 'Company is required' })
      .min(1, 'Company is required')
      .optional(),
    street1: z
      .string({ required_error: 'Street1 is required' })
      .min(1, 'Street1 is required')
      .optional(),
    street2: z.string().optional(),
    city: z
      .string({ required_error: 'City is required' })
      .min(1, 'City is required')
      .optional(),
    state: z
      .string({ required_error: 'State is required' })
      .min(1, 'State is required')
      .optional(),
    zip: z
      .string({ required_error: 'ZIP is required' })
      .min(1, 'ZIP is required')
      .optional(),
    zipCode: z.number().int().positive('Invalid zip code').optional(),
    country: z
      .string({ required_error: 'Country is required' })
      .min(1, 'Country is required')
      .optional(),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(10, 'Phone number is required')
      .optional(),
    alternativePhoneNumber: z
      .string({ required_error: 'Alternative phone number is required' })
      .min(10, 'Alternative phone number is required')
      .optional(),
    email: z.string().email('Invalid email format').optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
  }),
});

const StoreValidations = {
  createStoreValidationSchema,
  updateStoreValidationSchema,
};

export default StoreValidations;
