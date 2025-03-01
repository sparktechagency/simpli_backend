import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReviewService from './review.service';

const createReview = catchAsync(async (req, res) => {
  const result = await ReviewService.createReview(req.user.profileId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const ReviewController = {
  createReview,
};

export default ReviewController;
