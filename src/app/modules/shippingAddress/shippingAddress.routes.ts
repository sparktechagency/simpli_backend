import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import ShippingAddressController from './shippingAddress.controller';
import ShippingAddressValidations from './shippingAddress.validation';

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

router.get(
  '/get-shipping-address',
  auth(USER_ROLE.reviewer),
  ShippingAddressController.getShippingAddress,
);

router.get(
  '/delete-shipping-address/:id',
  auth(USER_ROLE.reviewer),
  ShippingAddressController.deleteShippingAddress,
);

export const shippingAddressRoutes = router;
