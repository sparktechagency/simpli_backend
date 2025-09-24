import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from './user.constant';
import userControllers from './user.controller';
import userValidations from './user.validation';

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
  '/block-unblock/:id',
  auth(USER_ROLE.superAdmin),
  userControllers.changeUserStatus,
);
router.post(
  '/delete-account',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  validateRequest(userValidations.deleteUserAccountValidationSchema),
  userControllers.deleteAccount,
);

export const userRoutes = router;
