/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { CAMPAIGN_STATUS } from '../../utilities/enum';
import { CampaignOffer } from '../campaignOffer/campaignOffer.model';
import Comment from '../comment/comment.model';
import Reviewer from '../reviewer/reviewer.model';
import Review from './reviewer.model';

const createReview = async (reviewerId: string, payload: any) => {
  const campaignOffer = await CampaignOffer.findById(payload.campaignOfferId)
    .populate<{
      campaign: { status: string; _id: mongoose.Schema.Types.ObjectId };
    }>({
      path: 'campaign',
      select: 'status',
    })
    .populate<{
      product: {
        _id: mongoose.Schema.Types.ObjectId;
        category: mongoose.Schema.Types.ObjectId;
      };
    }>({ path: 'product', select: 'category' });
  if (!campaignOffer) {
    throw new AppError(httpStatus.NOT_FOUND, 'This campaign offer not found');
  }
  if (campaignOffer.campaign.status !== CAMPAIGN_STATUS.ACTIVE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This campaign not active right now',
    );
  }

  // TODO: when create review---------------
  const result = await Review.create({
    ...payload,
    reviewer: reviewerId,
    campaign: campaignOffer.campaign._id,
    product: campaignOffer.product._id,
    category: campaignOffer.product.category,
    bussiness: campaignOffer.business,
    amount: campaignOffer.amount,
  });
  return result;
};

//----------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const getAllReviewFromDB = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const reviewer = await Reviewer.findById(reviewerId).select('following');
  let filterQuery = {};
  if (query.following) {
    filterQuery = { reviewer: { $in: reviewer?.following } };
  }

  const reviewQuery = new QueryBuilder(
    Review.find({ ...filterQuery })
      .populate({ path: 'product', select: 'name price' })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'reviewer', select: 'name username profile_image' }),
    query,
  )
    .search(['description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  let reviews = await reviewQuery.modelQuery;
  reviews = await Promise.all(
    reviews.map(async (review: any) => {
      const totalComments = await Comment.countDocuments({
        reviewId: review._id,
      });
      const isLike = review.likers.some((liker: Types.ObjectId) =>
        liker.equals(reviewerId),
      );
      return {
        ...review.toObject(),
        totalComments,
        isLike,
      };
    }),
  );
  const meta = await reviewQuery.countTotal();

  return {
    meta,
    result: reviews,
  };
};

// get my revies--------------------->>>>>
const getMyReviews = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ reviewer: reviewerId })
      .populate({ path: 'product', select: 'name price' })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'reviewer', select: 'name username profile_image' }),
    query,
  )
    .search(['description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  let reviews = await reviewQuery.modelQuery;
  reviews = await Promise.all(
    reviews.map(async (review: any) => {
      const totalComments = await Comment.countDocuments({
        reviewId: review._id,
      });
      const isLike = review.likers.some((liker: Types.ObjectId) =>
        liker.equals(reviewerId),
      );
      return {
        ...review.toObject(),
        totalComments,
        isLike,
      };
    }),
  );
  const meta = await reviewQuery.countTotal();

  return {
    meta,
    result: reviews,
  };
};

// get all liker--------------------->>>>>>>>>>
const getReviewLikers = async (
  reviewId: string,
  query: Record<string, unknown>,
) => {
  const review = await Review.findById(reviewId).select('likers').lean();
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const likerQuery = new QueryBuilder(
    Reviewer.find({ _id: { $in: review.likers } }).select('name profile_image'),
    query,
  );

  const result = await likerQuery.modelQuery;
  const meta = await likerQuery.countTotal();

  return {
    meta,
    result,
  };
};

//
const likeUnlikeReview = async (reviewId: string, userId: string) => {
  try {
    const review = await Review.findById(reviewId).select('likers');
    if (!review) {
      throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = review.likers.includes(userObjectId);

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      alreadyLiked
        ? { $pull: { likers: userObjectId } }
        : { $push: { likers: userObjectId } },
      { new: true },
    ).select('likers');

    return {
      reviewId,
      liked: !alreadyLiked,
      totalLikes: updatedReview?.likers.length,
    };
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while toggling like.',
    );
  }
};

// get single product review-----

const getSingleProductReview = async (
  productId: string,
  query: Record<string, unknown>,
) => {
  const resultQuery = new QueryBuilder(
    Review.find({ product: productId })
      .select('reviewer createdAt rating description')
      .populate({ path: 'reviewer', select: 'profile_image name' }),
    query,
  )
    .search(['description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await resultQuery.modelQuery;
  const meta = await resultQuery.countTotal();
  const avgRatingData = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const averageRating =
    avgRatingData.length > 0 ? avgRatingData[0].averageRating : 0;
  return {
    meta,
    result,
    averageRating,
  };
};

const ReviewService = {
  createReview,
  getAllReviewFromDB,
  getReviewLikers,
  likeUnlikeReview,
  getMyReviews,
  getSingleProductReview,
};

export default ReviewService;
