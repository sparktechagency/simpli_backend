import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import OrderController from './order.controller';
import validateRequest from '../../middlewares/validateRequest';
import OrderValidations from './order.validation';

const router = express.Router();

router.post(
  '/create-order',
  auth(USER_ROLE.reviewer),
  validateRequest(OrderValidations.createOrderValidationSchema),
  OrderController.createOrder,
);

router.get(
  '/get-my-orders',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  OrderController.getMyOrders,
);

export const orderRoutes = router;
