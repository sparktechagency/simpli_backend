import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import ShippingAddressValidations from './shippingAddress.validation';
import ShippingAddressController from './shippingAddress.controller';

const router = express.Router();

router.post(
  '/create-shipping-address',
  auth(USER_ROLE.reviewer),
  validateRequest(ShippingAddressValidations.shippingAddressValidationSchema),
  ShippingAddressController.createShippingAddress,
);

router.patch(
  '/update-shipping-address/:id',
  auth(USER_ROLE.reviewer),
  validateRequest(
    ShippingAddressValidations.updateShippingAddressValidationSchema,
  ),
  ShippingAddressController.updateShippingAddress,
);

export const shippingAddressRoutes = router;
