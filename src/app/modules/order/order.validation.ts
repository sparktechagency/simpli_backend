import { Types } from 'mongoose';
import { z } from 'zod';
import { ENUM_PAYMENT_METHOD } from '../../utilities/enum';

const createOrderValidationSchema = z.object({
  body: z.object({
    shippingAddress: z
      .string({ required_error: `Shipping address is required` })
      .refine((val) => Types.ObjectId.isValid(val), {
        message: `Shipping address must be a valid ObjectId`,
      }),
    paymentMethod: z.enum(
      Object.values(ENUM_PAYMENT_METHOD) as [string, ...string[]],
    ),
    selectedRateId: z.string({ required_error: 'Selected rated id required' }),
    shipmentId: z.string({ required_error: 'Shipment id is required' }),
  }),
});

const OrderValidations = {
  createOrderValidationSchema,
};

export default OrderValidations;
