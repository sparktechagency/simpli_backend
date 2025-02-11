import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReviewerService from './reviewer.service';

const addPersonalInfo = catchAsync(async (req, res) => {
  const result = await ReviewerService.addPersonalInfo(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Peronal info added successfully',
    data: result,
  });
});

const ReviewerController = {
  addPersonalInfo,
};

export default ReviewerController;
