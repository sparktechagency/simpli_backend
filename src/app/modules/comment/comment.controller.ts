/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import CommentServices from './comment.service';

const createComment = catchAsync(async (req, res) => {
  const file: any = req.files?.comment_image;
  if (req.files?.comment_image) {
    req.body.image = getCloudFrontUrl(file[0].key);
  }
  const result = await CommentServices.createComment(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

const createReply = catchAsync(async (req, res) => {
  const file: any = req.files?.comment_image;
  if (req.files?.comment_image) {
    req.body.image = getCloudFrontUrl(file[0].key);
  }
  const result = await CommentServices.createReply(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reply created successfully',
    data: result,
  });
});
const updateComment = catchAsync(async (req, res) => {
  const file: any = req.files?.comment_image;
  if (req.files?.comment_image) {
    req.body.image = getCloudFrontUrl(file[0].key);
  }
  const result = await CommentServices.updateComment(
    req.user,
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
const deleteComment = catchAsync(async (req, res) => {
  const result = await CommentServices.deleteComment(
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
const likeUnlikeComment = catchAsync(async (req, res) => {
  const result = await CommentServices.likeUnlikeComment(
    req.params.id,
    req.user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.liked
      ? 'Like added successfully'
      : 'Like remove successfully',
    data: result,
  });
});
const getReviewComments = catchAsync(async (req, res) => {
  const result = await CommentServices.getReviewComments(
    req.user.profileId,
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment retrieved  successfully',
    data: result,
  });
});
const getReplies = catchAsync(async (req, res) => {
  const result = await CommentServices.getReplies(
    req.user.profileId,
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Replies retrieved  successfully',
    data: result,
  });
});
const getAllLikersForComment = catchAsync(async (req, res) => {
  const result = await CommentServices.getAllLikersForComment(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Likers retrieved  successfully',
    data: result,
  });
});

// get my comments
const getMyComments = catchAsync(async (req, res) => {
  const result = await CommentServices.getMyComments(
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
  const result = await CommentServices.getMyLinkes(
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
  createComment,
  createReply,
  updateComment,
  deleteComment,
  getReviewComments,
  likeUnlikeComment,
  getReplies,
  getAllLikersForComment,
  getMyComments,
  getMyLikes,
};
export default CommentController;
