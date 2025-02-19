import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import NotificationSettingController from './notificationSetting.controller';
import validateRequest from '../../middlewares/validateRequest';
import NoficationSettingValidations from './notificationSetting.validation';

const router = express.Router();

router.patch(
  '/update-notification-setting',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  validateRequest(NoficationSettingValidations.updateNotificationSettingSchema),
  NotificationSettingController.updateNotificationSetting,
);
router.get(
  '/get-notification-setting',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  NotificationSettingController.getNotificationSetting,
);
export const notificationSettingRoutes = router;
