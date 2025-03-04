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
    req.body.thumbnail = files['thumbnail'][0].path;
  }

  const result = await ReviewService.createReview(req.user.profileId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

// get all review
const getAllReview = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReviewFromDB(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

// get my reviews
const getMyReview = catchAsync(async (req, res) => {
  const result = await ReviewService.getMyReviews(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

// get review liker
const getReviewLikers = catchAsync(async (req, res) => {
  const result = await ReviewService.getReviewLikers(req.params.id, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review likers retrieved successfully',
    data: result,
  });
});

//
const likeUnlikeReview = catchAsync(async (req, res) => {
  const result = await ReviewService.likeUnlikeReview(
    req.params.id,
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Liked added successfully',
    data: result,
  });
});
//
const getSingleProductReview = catchAsync(async (req, res) => {
  const result = await ReviewService.getSingleProductReview(
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single product review retrieved successfully',
    data: result,
  });
});

const ReviewController = {
  createReview,
  getAllReview,
  getReviewLikers,
  likeUnlikeReview,
  getMyReview,
  getSingleProductReview,
};

export default ReviewController;
