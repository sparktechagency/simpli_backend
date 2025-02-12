import { INotificationSetting } from './notificationSetting.interface';
import { NotificationSetting } from './notificationSetting.model';

const updateNotificationSetting = async (
  userId: string,
  payload: Partial<INotificationSetting>,
) => {
  const result = await NotificationSetting.findOneAndUpdate(
    { user: userId },
    payload,
    { new: true, runValidators: true },
  );
  return result;
};

const NotificationSettingService = {
  updateNotificationSetting,
};

export default NotificationSettingService;
