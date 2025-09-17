/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReviewService from './review.service';

const createReview = catchAsync(async (req, res) => {
  // if (req.files?.review_image) {
  //   req.body.images = req.files.review_image.map((file: any) => {
  //     return getCloudFrontUrl(file.key);
  //   });
  // }

  // const videoFile: any = req.files?.review_video;
  // if (req.files?.review_video) {
  //   req.body.video = getCloudFrontUrl(videoFile[0].key);
  // }

  const thumnail: any = req.files?.thumbnail;
  if (req.files?.thumbnail) {
    req.body.thumbnail = getCloudFrontUrl(thumnail[0].key);
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
    message: result.liked
      ? 'Liked added successfully'
      : 'Like removed successfully',
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
