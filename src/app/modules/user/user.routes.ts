import validateRequest from '../../middlewares/validateRequest';
import userControllers from './user.controller';
import { Router } from 'express';
import userValidations from './user.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';

const router = Router();

router.post(
  '/register-bussiness',
  validateRequest(userValidations.registerBussinessOwnerValidationSchema),
  userControllers.registerUser,
);
router.post(
  '/register-reviewer',
  validateRequest(userValidations.registerReviewValidationSchema),
  userControllers.registerReviewer,
);

router.post(
  '/verify-code',
  validateRequest(userValidations.verifyCodeValidationSchema),
  userControllers.verifyCode,
);

router.post(
  '/resend-verify-code',
  validateRequest(userValidations.resendVerifyCodeSchema),
  userControllers.resendVerifyCode,
);

router.patch(
  '/change-status/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(userValidations.changeUserStatus),
  userControllers.changeUserStatus,
);

export const userRoutes = router;
