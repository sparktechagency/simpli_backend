import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import ReviewerValidations from './reviewer.validation';
import ReviewerController from './reviewer.controller';
const router = express.Router();

router.post(
  '/add-address',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewerValidations.addAddressValidationSchema),
  ReviewerController.addAddress,
);
router.post(
  '/add-personal-info',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewerValidations.addPersonalInfoValidationSchema),
  ReviewerController.addPersonalInfo,
);

export const reviewRoutes = router;
