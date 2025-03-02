/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Comment from './comment.model';
import Reviewer from '../reviewer/reviewer.model';
import { IComment } from './comment.interface';
import Review from '../review/reviewer.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

const getComments = async (
  reviewId: string,
  query: Record<string, unknown>,
) => {
  try {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 5;
    const replyLimit = parseInt(query.replyLimit as string) || 2;
    // const comments: any = await Comment.find({
    //   reviewId,
    //   parentCommentId: null,
    // })
    //   .sort({ createdAt: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .populate('userId', 'name profile_image')
    //   .select('text userId createdAt likers')
    //   .lean();

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
    console.log('comments', comments);

    for (const comment of comments) {
      comment.replyCount = await Comment.countDocuments({
        parentCommentId: comment._id,
      });
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

    const totalComments = await Comment.countDocuments({
      reviewId,
      parentCommentId: null,
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      comments,
    };
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, error.message);
  }
};

const getCommetReplies = async (
  commentId: string,
  query: Record<string, unknown>,
) => {
  try {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 5;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }
    const totalReplies = await Comment.countDocuments({
      parentCommentId: commentId,
    });
    const replies: any = await Comment.find({ parentCommentId: commentId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name profile_image')
      .select('text userId createdAt likers')
      .lean();

    for (const reply of replies) {
      reply.likersCount = reply.likers.length;
      reply.likers = await Reviewer.find({ _id: { $in: reply.likers } })
        .limit(3)
        .select('name profile_image')
        .lean();
    }

    return {
      currentPage: page,
      totalPages: Math.ceil(totalReplies / limit),
      replies,
    };
  } catch (error) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, 'Something went wrong');
  }
};

const getCommentLikers = async (
  commentId: string,
  query: Record<string, unknown>,
) => {
  try {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;

    const comment = await Comment.findById(commentId).select('likers').lean();
    if (!comment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    const totalLikers = comment.likers.length;

    const likers = await Reviewer.find({ _id: { $in: comment.likers } })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name profile_image')
      .lean();

    return {
      totalLikers,
      currentPage: page,
      totalPages: Math.ceil(totalLikers / limit),
      likers,
    };
  } catch (error) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, 'Something went wrong');
  }
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
  try {
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
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while toggling like.',
    );
  }
};

const CommentService = {
  getComments,
  getCommetReplies,
  getCommentLikers,
  createComment,
  createReply,
  likeUnlikeComment,
};

export default CommentService;
