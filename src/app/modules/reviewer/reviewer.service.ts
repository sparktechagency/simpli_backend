import { INTEREST_STATUS } from '../../utilities/enum';
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

const addInterestedCategory = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.interestedCategoryStatus = INTEREST_STATUS.COMPLETED;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};
const addCurrentlyShareReview = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.interestedCategoryStatus = INTEREST_STATUS.COMPLETED;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const addSocailInfo = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.socailInfoStatus = INTEREST_STATUS.COMPLETED;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// update reviewer

const updateReviewerIntoDB = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const makeSkip = async (reviewerId: string, skipValue: string) => {
  const result = await Reviewer.findByIdAndUpdate(
    reviewerId,
    {
      $set: { [skipValue]: INTEREST_STATUS.COMPLETED },
    },
    { new: true, runValidators: true },
  );

  return result;
};

const ReviewerService = {
  addAddress,
  addPersonalInfo,
  addInterestedCategory,
  addCurrentlyShareReview,
  addSocailInfo,
  updateReviewerIntoDB,
  makeSkip,
};

export default ReviewerService;
