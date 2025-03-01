import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import CommentController from './comment.controller';

const router = express.Router();

router.get(
  '/get-review-comments/:id',
  auth(USER_ROLE.reviewer),
  CommentController.getReviewComments,
);
router.get(
  '/get-comment-replies',
  auth(USER_ROLE.reviewer),
  CommentController.getCommentReplies,
);
router.get(
  '/get-comment-likers/:id',
  auth(USER_ROLE.reviewer),
  CommentController.getCommentLikers,
);

export const commentRoutes = router;
