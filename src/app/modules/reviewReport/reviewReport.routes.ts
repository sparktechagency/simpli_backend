import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ReviewReportController from './reviewReport.controller';
import validateRequest from '../../middlewares/validateRequest';
import ReviewReportValidations from './reviewReport.validation';

const router = express.Router();

router.post(
  '/create-report',
  auth(USER_ROLE.reviewer),
  validateRequest(ReviewReportValidations.createReviewReportSchema),
  ReviewReportController.createReviewReport,
);

export const reviewReportRoutes = router;
