import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import StripeController from './stripe.controller';

const router = express.Router();

router.post(
  '/create-onboarding-link',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  StripeController.createOnboardingLink,
);
router.post(
  '/update-onboarding-link',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  StripeController.updateOnboardingLink,
);

export const stripeRoutes = router;
