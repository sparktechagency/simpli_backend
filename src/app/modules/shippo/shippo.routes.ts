import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ShippoController from './shippo.controller';

const router = express.Router();

router.post('/get-shipping-methods', ShippoController.getShippingMethods);
router.post(
  '/get-shipping-rates',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  ShippoController.getShippingRatesForCheckout,
);

export const shippoRoutes = router;
