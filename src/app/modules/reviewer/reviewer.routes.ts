import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import ReviewerValidations from './reviewer.validation';
import ReviewerController from './reviewer.controller';
import { uploadFile } from '../../aws/multer-s3-uploader';
const router = express.Router();

router.get(
  '/get-profile',
  auth(USER_ROLE.reviewer),
  ReviewerController.getReviewerProfile,
);
router.post(
  '/add-address',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewerValidations.addAddressValidationSchema),
  ReviewerController.addAddress,
);
router.post(
  '/add-personal-info',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewerValidations.addPersonalInfoValidationSchema),
  ReviewerController.addPersonalInfo,
);
router.post(
  '/add-interested-category',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewerValidations.addInterestedCategoryValidation),
  ReviewerController.addInterestedCategory,
);
router.post(
  '/add-currently-share-review',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewerValidations.addCurrentlyShareReviewValidationSchema),
  ReviewerController.addCurrentlyShareReview,
);

router.post(
  '/add-social-info',
  auth(USER_ROLE.reviewer),
  ReviewerController.addSocailInfo,
);

router.patch(
  '/update-reviewer-profile',
  auth(USER_ROLE.reviewer),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  ReviewerController.updateReviewerIntoDB,
);
router.patch('/update-reviewer-profile', auth(USER_ROLE.reviewer));
router.post(
  '/make-skip',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewerValidations.makeSkipValidationSchema),
  ReviewerController.makeSkip,
);

router.post(
  '/follow-unfollow-reviewer/:id',
  auth(USER_ROLE.reviewer),
  ReviewerController.followUnfollowReviewer,
);
router.post(
  '/follow-unfollow-bussiness/:id',
  auth(USER_ROLE.reviewer),
  ReviewerController.followUnfollowBussiness,
);
export const reviewerRoutes = router;
