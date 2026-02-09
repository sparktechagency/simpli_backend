import express, { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../../aws/multer-s3-uploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import ReviewController from './review.controller';
import ReviewValidation from './review.validation';

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
  '/get-my-reviews',
  auth(USER_ROLE.reviewer),
  ReviewController.getMyReview,
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

router.get(
  '/get-single-product-review/:id',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  ReviewController.getSingleProductReview,
);
router.post('/view/:id', auth(USER_ROLE.reviewer), ReviewController.viewReview);
router.delete(
  '/delete/:id',
  auth(USER_ROLE.reviewer),
  ReviewController.deleteVideo,
);
export const reviewRoutes = router;
