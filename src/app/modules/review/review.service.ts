import QueryBuilder from '../../builder/QueryBuilder';
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

const ReviewService = {
  createReview,
  getAllReviewFromDB,
};

export default ReviewService;
