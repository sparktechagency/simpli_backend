import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReviewerService from './reviewer.service';

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

const ReviewerController = {
  addAddress,
  addPersonalInfo,
  addInterestedCategory,
  addCurrentlyShareReview,
};

export default ReviewerController;
