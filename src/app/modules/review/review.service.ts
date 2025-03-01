import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IReview } from './review.interface';
import Review from './reviewer.model';

const createReview = async (reviewerId: string, payload: IReview) => {
  const result = await Review.create({ ...payload, reviewer: reviewerId });
  return result;
};

const getAllReviewFromDB = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const reviewQuery = new QueryBuilder(Review.find(), query)
    .search(['description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();

  return {
    meta,
    result,
  };
};

// get all liker-----------
const getReviewLikers = async (postId: string) => {
  const likers = Review.findById(postId)
    .populate({ path: 'likers', select: 'name profile_image' })
    .select('likers')
    .lean();
  if (!likers) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  return likers;
};

const ReviewService = {
  createReview,
  getAllReviewFromDB,
  getReviewLikers,
};

export default ReviewService;
