import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReviewService from './review.service';

const createReview = catchAsync(async (req, res) => {
  // TOOD: need to upload in aws s3
  const { files } = req;
  if (files && typeof files === 'object' && 'review_image' in files) {
    const newImages = files['review_image'].map((file) => file.path);
    req.body.images = newImages;
  }

  if (files && typeof files === 'object' && 'review_video' in files) {
    req.body.video = files['review_video'][0].path;
  }
  if (files && typeof files === 'object' && 'thumbnail' in files) {
    req.body.video = files['thumbnail'][0].path;
  }

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
