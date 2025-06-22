/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import CommentService from './comment.service';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';

const getReviewComments = catchAsync(async (req, res) => {
  const result = await CommentService.getComments(
    req.user.profileId,
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});
const getCommentReplies = catchAsync(async (req, res) => {
  const result = await CommentService.getCommetReplies(
    req.user.profileId,
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Replies retrieved successfully',
    data: result,
  });
});

//
const getCommentLikers = catchAsync(async (req, res) => {
  const result = await CommentService.getCommentLikers(
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Likers retrieved successfully',
    data: result,
  });
});

// create comment
const createComment = catchAsync(async (req, res) => {
  const file: any = req.files?.comment_image;
  if (req.files?.comment_image) {
    req.body.image = getCloudFrontUrl(file[0].key);
  }
  const result = await CommentService.createComment(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});
const createReply = catchAsync(async (req, res) => {
  const file: any = req.files?.comment_image;
  if (req.files?.comment_image) {
    req.body.image = getCloudFrontUrl(file[0].key);
  }
  const result = await CommentService.createReply(req.user.profileId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Replied added successfully',
    data: result,
  });
});
const likeUnlikeReview = catchAsync(async (req, res) => {
  const result = await CommentService.likeUnlikeComment(
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
const deleteComment = catchAsync(async (req, res) => {
  const result = await CommentService.deleteComment(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: result,
  });
});
const updateComment = catchAsync(async (req, res) => {
  const file: any = req.files?.comment_image;
  if (req.files?.comment_image) {
    req.body.image = getCloudFrontUrl(file[0].key);
  }
  const result = await CommentService.updateComment(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

// get my comments
const getMyComments = catchAsync(async (req, res) => {
  const result = await CommentService.getMyComments(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment retrieved successfully',
    data: result,
  });
});
const getMyLikes = catchAsync(async (req, res) => {
  const result = await CommentService.getMyLinkes(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Like retrieved successfully',
    data: result,
  });
});

const CommentController = {
  getReviewComments,
  getCommentReplies,
  getCommentLikers,
  createComment,
  createReply,
  likeUnlikeReview,
  deleteComment,
  updateComment,
  getMyComments,
  getMyLikes,
};

export default CommentController;
