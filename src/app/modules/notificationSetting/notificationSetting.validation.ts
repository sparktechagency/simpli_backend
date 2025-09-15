import { z } from 'zod';

const updateNotificationSettingSchema = z.object({
  body: z.object({
    pushNotification: z.boolean().optional(),
    mention: z.boolean().optional(),
    commentOnPost: z.boolean().optional(),
    likeOnPost: z.boolean().optional(),
    likeOnComment: z.boolean().optional(),
    newFollower: z.boolean().optional(),
    postYouFollow: z.boolean().optional(),
    trendingPost: z.boolean().optional(),
    newPost: z.boolean().optional(),
    postFromFollower: z.boolean().optional(),
    general: z.boolean().optional(),
    customerNotification: z.boolean().optional(),
    orderNotification: z.boolean().optional(),
  }),
});

const NoficationSettingValidations = {
  updateNotificationSettingSchema,
};

export default NoficationSettingValidations;
