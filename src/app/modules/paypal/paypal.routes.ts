import express from 'express';
import PaypalController from './paypal.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/create-onboarding-link',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  PaypalController.createOnboardingLinkForPaypalPartner,
);
router.get('/onboarding-success', PaypalController.savePaypalAccount);

export const paypalRoutes = router;
