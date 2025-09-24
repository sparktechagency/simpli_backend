import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import OrderController from './order.controller';
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
router.get(
  '/get-single-order/:id',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  OrderController.getSingleOrder,
);
router.get(
  '/track-order/:id',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  OrderController.trackingOrder,
);

export const orderRoutes = router;
