import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import PaymentController from './payment.controller';
import PaymentValidations from './payment.validation';

const router = express.Router();

router.post(
  '/make-withdraw',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  validateRequest(PaymentValidations.makeWithdrawValidationSchema),
  PaymentController.makeWithDraw,
);

export const paymentRoutes = router;
