import { z } from 'zod';
import { bussinessType, industryType } from './bussiness.constant';

const addBussinessInfoValidationSchema = z.object({
  body: z.object({
    bussinessName: z.string().min(1, 'Business name is required'),
    companyEmail: z.string().email('Please use a valid email address'),
    tradeName: z.string().min(1, 'Trade name is required'),
    bussinessType: z.enum(
      Object.values(bussinessType) as [string, ...string[]],
    ),
    industryType: z.enum(Object.values(industryType) as [string, ...string[]]),
    bussinessAddress: z.string().min(1, 'Business address is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    website: z.string().url('Please use a valid website URL'),
    taxtIndentificationNumber: z
      .number()
      .int('Tax Identification Number must be an integer')
      .positive('Tax Identification Number must be positive'),
  }),
});

const bussinessValidations = {
  addBussinessInfoValidationSchema,
};

export default bussinessValidations;
