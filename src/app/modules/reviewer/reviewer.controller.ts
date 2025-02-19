import httpStatus from 'http-status';
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
  const { files } = req;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
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

const ReviewerController = {
  addAddress,
  addPersonalInfo,
  addInterestedCategory,
  addCurrentlyShareReview,
  addSocailInfo,
  updateReviewerIntoDB,
  makeSkip,
  getReviewerProfile,
};

export default ReviewerController;
