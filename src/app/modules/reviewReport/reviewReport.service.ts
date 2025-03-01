import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Review from '../review/reviewer.model';
import { IReviewReport } from './reviewReport.interface';
import ReviewReport from './reviewReport.model';

const createReviewReport = async (
  profileId: string,
  payload: IReviewReport,
) => {
  const review = await Review.exists({ _id: payload.review });
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  const result = await ReviewReport.create({ ...payload, reporter: profileId });
  return result;
};

const ReviewReportService = {
  createReviewReport,
};

export default ReviewReportService;
