/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Comment from './comment.model';
import Reviewer from '../reviewer/reviewer.model';
import { IComment } from './comment.interface';
import Review from '../review/reviewer.model';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

const getComments = async (
  profileId: string,
  reviewId: string,
  query: Record<string, unknown>,
) => {
  try {
    const replyLimit = parseInt(query.replyLimit as string) || 2;
    const commentQuery = new QueryBuilder(
      Comment.find({ reviewId, parentCommentId: null })
        .populate({
          path: 'userId',
          select: 'name profile_image',
        })
        .lean(),
      query,
    )
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const comments: any = await commentQuery.modelQuery;

    for (const comment of comments) {
      comment.replyCount = await Comment.countDocuments({
        parentCommentId: comment._id,
      });
      comment.isLike = comment.likers.some((liker: Types.ObjectId) =>
        liker.equals(profileId),
      );
      comment.likersCount = comment.likers.length;
      comment.likers = await Reviewer.find({ _id: { $in: comment.likers } })
        .limit(3)
        .select('name profile_image')
        .lean();
      comment.replies = await Comment.find({ parentCommentId: comment._id })
        .sort({ createdAt: 1 })
        .limit(replyLimit)
        .populate('userId', 'name profile_image')
        .select('text userId createdAt likers')
        .lean();

      for (const reply of comment.replies) {
        reply.likersCount = reply.likers.length;
        reply.likers = await Reviewer.find({ _id: { $in: reply.likers } })
          .limit(3)
          .select('name profile_image')
          .lean();
      }
    }

    const meta = await commentQuery.countTotal();
    return {
      meta,
      result: comments,
    };
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, error.message);
  }
};

const getCommetReplies = async (
  profileId: string,
  commentId: string,
  query: Record<string, unknown>,
) => {
  const replyLimit = parseInt(query.replyLimit as string) || 2;
  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const replyQuery = new QueryBuilder(
    Comment.find({ parentCommentId: commentId }).lean(),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const replies: any = await replyQuery.modelQuery;

  for (const reply of replies) {
    reply.likersCount = reply.likers.length;
    reply.isLike = reply.likers.some((liker: Types.ObjectId) =>
      liker.equals(profileId),
    );
    reply.likers = await Reviewer.find({ _id: { $in: reply.likers } })
      .limit(3)
      .select('name profile_image')
      .lean();
    reply.replies = await Comment.find({ parentCommentId: reply._id })
      .sort({ createdAt: 1 })
      .limit(replyLimit)
      .populate('userId', 'name')
      .select('text userId createdAt likers')
      .lean();
    reply.replyCount = await Comment.countDocuments({
      parentCommentId: reply._id,
    });
  }

  const meta = await replyQuery.countTotal();

  return {
    meta,
    result: replies,
  };
};
const getCommentLikers = async (
  commentId: string,
  query: Record<string, unknown>,
) => {
  const comment = await Comment.findById(commentId).select('likers').lean();
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const likerQuery = new QueryBuilder(
    Reviewer.find({ _id: { $in: comment.likers } }).select(
      'name profile_image',
    ),
    query,
  );

  const result = await likerQuery.modelQuery;
  const meta = await likerQuery.countTotal();

  return {
    meta,
    result,
  };
};
const createComment = async (profileId: string, payload: IComment) => {
  const review = await Review.exists({ _id: payload.reviewId });
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  const result = await Comment.create({
    ...payload,
    userId: profileId,
    parentCommentId: null,
  });

  return result;
};

// create reply

const createReply = async (profileId: string, payload: IComment) => {
  const parentComment = await Comment.findById(payload.parentCommentId);
  if (!parentComment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parent comment not found.');
  }
  const result = await Comment.create({
    ...payload,
    reviewId: parentComment.reviewId,
    userId: profileId,
  });
  return result;
};

// like unlike comment
const likeUnlikeComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId).select('likers');
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const alreadyLiked = comment.likers.includes(userObjectId);

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    alreadyLiked
      ? { $pull: { likers: userObjectId } }
      : { $push: { likers: userObjectId } },
    { new: true },
  ).select('likers');

  return {
    commentId,
    liked: !alreadyLiked,
    totalLikes: updatedComment?.likers.length,
  };
};
const deleteComment = async (profileId: string, id: string) => {
  const comment = await Comment.findOne({ userId: profileId, _id: id });
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await Comment.deleteMany({ parentCommentId: comment._id });

  const result = await Comment.findByIdAndDelete(id);
  return result;
};

// edit comment
const updateComment = async (
  profileId: string,
  id: string,
  payload: Partial<IComment>,
) => {
  const comment = await Comment.findOne({ userId: profileId, _id: id });
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const result = await Comment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// get my comments
const getMyComments = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const commentQuery = new QueryBuilder(
    Comment.find({
      userId: reviewerId,
      parentCommentId: null,
    }).populate({
      path: 'reviewId',
      select: 'description images video thumbnail rating createdAt likers',
      populate: [
        { path: 'product', select: 'name price' },
        { path: 'category', select: 'name' },
        { path: 'reviewer', select: 'name profile_image' },
      ],
    }),
    query,
  );

  const result = await commentQuery.modelQuery;
  const meta = await commentQuery.countTotal();
  return {
    meta,
    result,
  };
};

// get my likes
const getMyLinkes = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const likeQuery = new QueryBuilder(
    Review.find({ likers: { $in: [profileId] } })
      .populate({ path: 'product', select: 'name price' })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'reviewer', select: 'name profile_image' }),
    query,
  );
  // const result = await likeQuery.modelQuery;

  let result = await likeQuery.modelQuery;
  result = await Promise.all(
    result.map(async (review: any) => {
      const totalComments = await Comment.countDocuments({
        reviewId: review._id,
      });
      const isLike = review.likers.some((liker: Types.ObjectId) =>
        liker.equals(profileId),
      );
      return {
        ...review.toObject(),
        totalComments,
        isLike,
      };
    }),
  );

  const meta = await likeQuery.countTotal();
  return {
    meta,
    result,
  };
};

const CommentService = {
  getComments,
  getCommetReplies,
  getCommentLikers,
  createComment,
  createReply,
  likeUnlikeComment,
  deleteComment,
  updateComment,
  getMyComments,
  getMyLinkes,
};

export default CommentService;
