import { IReviewer } from './reviewer.interface';
import Reviewer from './reviewer.model';

const addPersonalInfo = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const ReviewerService = {
  addPersonalInfo,
};

export default ReviewerService;
