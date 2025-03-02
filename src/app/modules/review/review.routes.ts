import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import validateRequest from '../../middlewares/validateRequest';
import ReviewValidation from './review.validation';
import ReviewController from './review.controller';

const router = express.Router();

router.post(
  '/create-review',
  auth(USER_ROLE.reviewer),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(ReviewValidation.reviewValidationSchema),
  ReviewController.createReview,
);

router.get(
  '/get-all-review',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  ReviewController.getAllReview,
);
router.get(
  '/get-review-likers/:id',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  ReviewController.getReviewLikers,
);

router.patch(
  '/like-unlike/:id',
  auth(USER_ROLE.reviewer),
  ReviewController.likeUnlikeReview,
);
export const reviewRoutes = router;
