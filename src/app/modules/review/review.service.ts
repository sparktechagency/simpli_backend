/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import Review from './reviewer.model';
import mongoose from 'mongoose';

import { CAMPAIGN_STATUS } from '../../utilities/enum';
import { CampaignOffer } from '../campaignOffer/campaignOffer.model';

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
  // TODO: when create review
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

const getAllReviewFromDB = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const reviewQuery = new QueryBuilder(Review.find(), query)
    .search(['description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();

  return {
    meta,
    result,
  };
};

// get all liker-----------
const getReviewLikers = async (postId: string) => {
  const likers = Review.findById(postId)
    .populate({ path: 'likers', select: 'name profile_image' })
    .select('likers')
    .lean();
  if (!likers) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  return likers;
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

const ReviewService = {
  createReview,
  getAllReviewFromDB,
  getReviewLikers,
  likeUnlikeReview,
};

export default ReviewService;
