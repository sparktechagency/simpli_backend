/* eslint-disable @typescript-eslint/no-explicit-any */
import { shouldSendNotification } from '../../helper/shouldSendNotification';
import { ENUM_NOTIFICATION_TYPE } from '../notification/notification.enum';
import Notification from '../notification/notification.model';
import Review from '../review/reviewer.model';
import Comment from './comment.model';

export const sendCommentNotification = async (
  reviewId: string,
  commentId: string,
) => {
  const review: any = await Review.findById(reviewId)
    .select('reviewer product')
    .populate({ path: 'product', select: 'name' });
  if (!review) return;
  if (
    !shouldSendNotification(ENUM_NOTIFICATION_TYPE.COMMENT, review.reviewer)
  ) {
    return;
  }
  const comment: any = await Comment.findById(commentId)
    .select('commentor')
    .populate({ path: 'commentor', select: 'name' });
  if (!comment) return;

  Notification.create({
    receiver: review.reviewer.toString(),
    title: 'New Comment on Your Review',
    type: ENUM_NOTIFICATION_TYPE.COMMENT,
    message: `${comment.commentor.name} commented on your ${review.product.name} review: ${review.product.name}`,
    data: {
      reviewId: review._id,
    },
  });
};
export const sendReplyNotification = async (
  reviewId: string,
  commentId: string,
) => {
  const review: any = await Review.findById(reviewId)
    .select('reviewer product')
    .populate({ path: 'product', select: 'name' });
  if (!review) return;
  if (
    !shouldSendNotification(ENUM_NOTIFICATION_TYPE.COMMENT, review.reviewer)
  ) {
    return;
  }
  const comment: any = await Comment.findById(commentId)
    .select('parent')
    .populate({
      path: 'parent',
      select: 'commentor',
      populate: { path: 'commentor', select: 'name' },
    });
  if (!comment) return;

  Notification.create({
    receiver: review.reviewer.toString(),
    title: `New Reply on Your Review Comment`,
    type: ENUM_NOTIFICATION_TYPE.COMMENT,
    message: `${comment.parent.commentor.name} replied to your comment on review`,
    data: {
      reviewId: review._id,
      commentId: commentId,
    },
  });
};
