import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import ReferralSalesController from './referralSales.controller';

const router = express.Router();

router.get(
  '/get-referral-sales',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  ReferralSalesController.getReferralSales,
);

export const referralSalesRoutes = router;
