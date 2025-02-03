import { z } from 'zod';

const createStoreValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(10, 'Phone number is required'),
    email: z.string().email('Invalid email format'),
    tagline: z.string().optional(),
    description: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.number().int().positive('Invalid zip code'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
  }),
});
const updateStoreValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    phone: z.string().min(10, 'Phone number is required').optional(),
    email: z.string().email('Invalid email format').optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    address: z.string().min(1, 'Address is required').optional(),
    country: z.string().min(1, 'Country is required').optional(),
    zipCode: z.number().int().positive('Invalid zip code').optional(),
    city: z.string().min(1, 'City is required').optional(),
    state: z.string().min(1, 'State is required').optional(),
  }),
});

const StoreValidations = {
  createStoreValidationSchema,
  updateStoreValidationSchema,
};

export default StoreValidations;
