import { IReviewer } from './reviewer.interface';
import Reviewer from './reviewer.model';

const addAddress = async (reviewerId: string, payload: Partial<IReviewer>) => {
  payload.isAddressProvided = true;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const addPersonalInfo = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.isPersonalInfoProvided = true;

  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const ReviewerService = {
  addAddress,
  addPersonalInfo,
};

export default ReviewerService;
