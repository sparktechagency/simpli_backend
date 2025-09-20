import { NotificationSettingField } from '../modules/notification/notification.enum';
import { NotificationSetting } from '../modules/notificationSetting/notificationSetting.model';

interface NotificationCheckOptions {
  type: NotificationSettingField;
  receiverId: string;
  actorId?: string;
}

export const shouldSendNotification = async (
  options: NotificationCheckOptions,
) => {
  const { type, receiverId, actorId } = options;

  if (!receiverId) return false;
  if (receiverId === actorId) return false;

  const settings = await NotificationSetting.findOne({ user: receiverId });
  if (!settings || !settings.pushNotification) return false;

  return !!settings[type];
};
