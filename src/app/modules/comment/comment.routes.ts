import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import CommentController from './comment.controller';
import { uploadFile } from '../../helper/fileUploader';

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

router.post(
  '/create-comment',
  auth(USER_ROLE.reviewer),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  CommentController.createComment,
);
router.post(
  '/create-reply',
  auth(USER_ROLE.reviewer),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  CommentController.createReply,
);

router.patch(
  '/like-unlike/:id',
  auth(USER_ROLE.reviewer),
  CommentController.likeUnlikeReview,
);

export const commentRoutes = router;
