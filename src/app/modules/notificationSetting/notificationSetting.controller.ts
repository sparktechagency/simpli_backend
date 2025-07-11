import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import NotificationSettingService from './notificationSetting.service';
import sendResponse from '../../utilities/sendResponse';

const updateNotificationSetting = catchAsync(async (req, res) => {
  const result = await NotificationSettingService.updateNotificationSetting(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification setting updated successfully',
    data: result,
  });
});
const getNotificationSetting = catchAsync(async (req, res) => {
  const result = await NotificationSettingService.getNotificationSetting(
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification setting retrieved successfully',
    data: result,
  });
});

const NotificationSettingController = {
  updateNotificationSetting,
  getNotificationSetting,
};

export default NotificationSettingController;
