import { z } from 'zod';
import {
  educationLevel,
  employmentStatus,
  ethnicity,
  familyAndDependents,
  householdIncome,
  maritalStatus,
} from './reviewer.constant';
import { ENUM_SKIP_VALUE, GENDER, INTEREST_STATUS } from '../../utilities/enum';

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
const addCurrentlyShareReviewValidationSchema = z.object({
  body: z.object({
    currentlyShareReview: z.array(z.string()),
  }),
});

const updateReviewerValidationSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.number().optional(),
  gender: z.enum(Object.values(GENDER) as [string, ...string[]]),
  age: z.number().min(18, 'Age must be at least 18').optional(),
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

  interestedCategory: z
    .array(z.string().min(24, 'Category ID must be a valid ObjectId'))
    .optional(), // Array of valid ObjectId references
  currentlyShareReview: z.array(z.string()).optional(),
  interestedCategoryStatus: z
    .enum(Object.values(INTEREST_STATUS) as [string, ...string[]])
    .optional(),
  currentShareReviewStatus: z
    .enum(Object.values(INTEREST_STATUS) as [string, ...string[]])
    .optional(),
  shippingInformationStatus: z
    .enum(Object.values(INTEREST_STATUS) as [string, ...string[]])
    .optional(),
  socailInfoStatus: z
    .enum(Object.values(INTEREST_STATUS) as [string, ...string[]])
    .optional(),
  profileDetailStatus: z
    .enum(Object.values(INTEREST_STATUS) as [string, ...string[]])
    .optional(),
  isPersonalInfoProvided: z.boolean().default(false),
  isAddressProvided: z.boolean().default(false),
  profile_image: z.string().default(''),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  blog: z.string().optional(),
});

const makeSkipValidationSchema = z.object({
  body: z.object({
    skipValue: z.enum(Object.values(ENUM_SKIP_VALUE) as [string, ...string[]]),
  }),
});

const ReviewerValidations = {
  addAddressValidationSchema,
  addPersonalInfoValidationSchema,
  addInterestedCategoryValidation,
  addCurrentlyShareReviewValidationSchema,
  updateReviewerValidationSchema,
  makeSkipValidationSchema,
};

export default ReviewerValidations;
