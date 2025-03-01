import { IReview } from './review.interface';
import Review from './reviewer.model';

const createReview = async (reviewerId: string, payload: IReview) => {
  const result = await Review.create({ ...payload, reviewer: reviewerId });
  return result;
};

const ReviewService = {
  createReview,
};

export default ReviewService;
