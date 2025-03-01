import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import CommentService from './comment.service';

const getReviewComments = catchAsync(async (req, res) => {
  const result = await CommentService.getComments(req.params.id, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});
const getCommentReplies = catchAsync(async (req, res) => {
  const result = await CommentService.getCommetReplies(
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
  const result = await CommentService.createComment(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});
const createReply = catchAsync(async (req, res) => {
  const result = await CommentService.createReply(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Replied added successfully',
    data: result,
  });
});

const CommentController = {
  getReviewComments,
  getCommentReplies,
  getCommentLikers,
  createComment,
  createReply,
};

export default CommentController;
