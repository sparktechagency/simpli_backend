import { z } from 'zod';

const addPersonalInfoValidationSchema = z.object({
  body: z.object({
    city: z
      .string()
      .min(3, 'City must be at least 3 characters long')
      .nonempty('City is required'),
    zipCode: z
      .string()
      .min(5, 'Zip Code must be at least 5 characters long')
      .nonempty('Zip Code is required'),
    gender: z.string().nonempty('Gender is required'),
    age: z
      .number()
      .min(18, 'Age must be at least 18')
      .max(100, 'Age must be less than 100')
      .int('Age must be a valid number'),
  }),
});

const ReviewerValidations = {
  addPersonalInfoValidationSchema,
};

export default ReviewerValidations;
