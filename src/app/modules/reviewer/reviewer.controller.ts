/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReviewerService from './reviewer.service';

const getReviewerProfile = catchAsync(async (req, res) => {
  const result = await ReviewerService.getReviewerProfile(req.user.profileId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});
const addAddress = catchAsync(async (req, res) => {
  const result = await ReviewerService.addAddress(req.user.profileId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Address added successfully',
    data: result,
  });
});
const addPersonalInfo = catchAsync(async (req, res) => {
  const result = await ReviewerService.addPersonalInfo(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Personal info added successfully',
    data: result,
  });
});
const addInterestedCategory = catchAsync(async (req, res) => {
  const result = await ReviewerService.addInterestedCategory(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Interested category info added successfully',
    data: result,
  });
});
const addCurrentlyShareReview = catchAsync(async (req, res) => {
  const result = await ReviewerService.addCurrentlyShareReview(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Currently share review added successfully',
    data: result,
  });
});
const addSocailInfo = catchAsync(async (req, res) => {
  const result = await ReviewerService.addSocailInfo(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Socail info  added successfully',
    data: result,
  });
});
const makeSkip = catchAsync(async (req, res) => {
  const result = await ReviewerService.makeSkip(
    req.user.profileId,
    req.body.skipValue,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${req.body.skipValue} is skipped successfully`,
    data: result,
  });
});
const updateReviewerIntoDB = catchAsync(async (req, res) => {
  const file: any = req.files?.profile_image;
  if (req.files?.profile_image) {
    req.body.profile_image = getCloudFrontUrl(file[0].key);
  }
  const result = await ReviewerService.updateReviewerIntoDB(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

// follow unfollow reviewer
const followUnfollowReviewer = catchAsync(async (req, res) => {
  const result = await ReviewerService.followUnfollowReviewer(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.following
      ? 'Successfully followed'
      : 'Successfully Unfollowed',
    data: result,
  });
});
const followUnfollowBussiness = catchAsync(async (req, res) => {
  const result = await ReviewerService.followUnfollowBussiness(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.following
      ? 'Successfully followed'
      : 'Successfully Unfollowed',
    data: result,
  });
});

const ReviewerController = {
  addAddress,
  addPersonalInfo,
  addInterestedCategory,
  addCurrentlyShareReview,
  addSocailInfo,
  updateReviewerIntoDB,
  makeSkip,
  getReviewerProfile,
  followUnfollowReviewer,
  followUnfollowBussiness,
};

export default ReviewerController;
