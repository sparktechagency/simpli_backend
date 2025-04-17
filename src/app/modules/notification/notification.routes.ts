import { USER_ROLE } from '../user/user.constant';
import express from 'express';
import auth from '../../middlewares/auth';
import notificationController from './notification.controller';
const router = express.Router();

router.get(
  '/get-notifications',
  auth(USER_ROLE.superAdmin, USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  notificationController.getAllNotification,
);
router.patch(
  '/see-notifications',
  auth(USER_ROLE.superAdmin, USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  notificationController.seeNotification,
);

export const notificationRoutes = router;
