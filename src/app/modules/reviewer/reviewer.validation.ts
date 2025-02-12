import { z } from 'zod';
import {
  educationLevel,
  employmentStatus,
  ethnicity,
  familyAndDependents,
  householdIncome,
  maritalStatus,
} from './reviewer.constant';

const addAddressValidationSchema = z.object({
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

const addPersonalInfoValidationSchema = z.object({
  body: z.object({
    ethnicity: z
      .enum(Object.values(ethnicity) as [string, ...string[]])
      .optional(),
    educationLevel: z
      .enum(Object.values(educationLevel) as [string, ...string[]])
      .optional(),
    maritalStatus: z
      .enum(Object.values(maritalStatus) as [string, ...string[]])
      .optional(),
    employmentStatus: z
      .enum(Object.values(employmentStatus) as [string, ...string[]])
      .optional(),
    householdIncome: z
      .enum(Object.values(householdIncome) as [string, ...string[]])
      .optional(),
    familyAndDependents: z
      .enum(Object.values(familyAndDependents) as [string, ...string[]])
      .optional(),
  }),
});

const addInterestedCategoryValidation = z.object({
  body: z.object({
    interestedCategory: z.array(z.string()),
  }),
});

const ReviewerValidations = {
  addAddressValidationSchema,
  addPersonalInfoValidationSchema,
  addInterestedCategoryValidation,
};

export default ReviewerValidations;
