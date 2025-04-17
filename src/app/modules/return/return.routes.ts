import express from 'express';

import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { returnValidations } from './return.validation';
import ReturnController from './return.controller';

const router = express.Router();

router.post(
  '/create-return',
  auth(USER_ROLE.reviewer),
  validateRequest(returnValidations.returnValidationSchema),
  ReturnController.createReturn,
);

router.get(
  '/all-return',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  ReturnController.getAllReturn,
);

export const returnRoutes = router;
