import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import CommentController from './comment.controller';
import validateRequest from '../../middlewares/validateRequest';
import CommentValidations from './comment.validation';
import { uploadFile } from '../../aws/multer-s3-uploader';

const router = express.Router();

router.get(
  '/get-review-comments/:id',
  auth(USER_ROLE.reviewer),
  CommentController.getReviewComments,
);
router.get(
  '/get-comment-replies/:id',
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
  validateRequest(CommentValidations.createCommentSchema),
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
  validateRequest(CommentValidations.createReplySchema),
  CommentController.createReply,
);

router.delete(
  '/delete-comment/:id',
  auth(USER_ROLE.reviewer),
  CommentController.deleteComment,
);

router.patch(
  '/update-comment/:id',
  auth(USER_ROLE.reviewer),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(CommentValidations.updateCommentValidationSchema),
  CommentController.updateComment,
);
router.patch(
  '/like-unlike/:id',
  auth(USER_ROLE.reviewer),
  CommentController.likeUnlikeReview,
);

router.get(
  '/get-my-comments',
  auth(USER_ROLE.reviewer),
  CommentController.getMyComments,
);

router.get(
  '/get-my-likes',
  auth(USER_ROLE.reviewer),
  CommentController.getMyLikes,
);

export const commentRoutes = router;
