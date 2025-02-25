import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import OrderController from './order.controller';

const router = express.Router();

router.post(
  '/create-order',
  auth(USER_ROLE.reviewer),
  OrderController.createOrder,
);

export const orderRoutes = router;
