import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { INTEREST_STATUS } from '../../utilities/enum';
import { IReviewer } from './reviewer.interface';
import Reviewer from './reviewer.model';

const getReviewerProfile = async (profileId: string) => {
  const result = await Reviewer.findById(profileId).populate({
    path: 'interestedCategory',
    select: 'name',
  });
  return result;
};

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
  if (payload.username) {
    const isExist = await Reviewer.findById({ username: payload.username });
    if (isExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'This username not available');
    }
  }
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
      $set: { [skipValue]: INTEREST_STATUS.SKIPPED },
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
  getReviewerProfile,
};

export default ReviewerService;
