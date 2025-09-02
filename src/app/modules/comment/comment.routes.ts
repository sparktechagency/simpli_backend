import express, { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../../aws/multer-s3-uploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import commentController from './comment.controller';
import commentValidations from './comment.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.reviewer),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(commentValidations.createCommentSchema),
  commentController.createComment,
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
  validateRequest(commentValidations.createReplySchema),
  commentController.createReply,
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
  validateRequest(commentValidations.updateCommentValidationSchema),
  commentController.updateComment,
);
router.delete(
  '/delete-comment/:id',
  auth(USER_ROLE.reviewer),

  commentController.deleteComment,
);

router.post(
  '/like-unlike/:id',
  auth(USER_ROLE.reviewer),
  commentController.likeUnlikeComment,
);

router.get(
  '/get-conversation-comments/:id',
  auth(USER_ROLE.reviewer),
  commentController.getPodcastComments,
);

router.get(
  '/get-replies/:id',
  auth(USER_ROLE.reviewer),
  commentController.getReplies,
);
router.get(
  '/get-likers/:id',
  auth(USER_ROLE.reviewer),
  commentController.getAllLikersForComment,
);

export const commentRoutes = router;
