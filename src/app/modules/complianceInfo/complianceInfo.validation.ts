import { z } from 'zod';

const createComplianceInfoValidationSchema = z.object({
  body: z.object({
    contactName: z.string().min(1, 'Contact name is required'),
    contactRole: z.string().min(1, 'Contact role is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
  }),
});
const updateComplianceInfoValidationSchema = z.object({
  body: z.object({
    contactName: z.string().min(1, 'Contact name is required').optional(),
    contactRole: z.string().min(1, 'Contact role is required').optional(),
    phoneNumber: z.string().min(1, 'Phone number is required').optional(),
  }),
});

const complicanceInfoValidations = {
  createComplianceInfoValidationSchema,
  updateComplianceInfoValidationSchema,
};

export default complicanceInfoValidations;
