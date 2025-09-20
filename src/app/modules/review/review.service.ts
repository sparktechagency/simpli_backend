/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { getCloudFrontUrl } from '../../helper/getCloudFontUrl';
import { CampaignOfferStatus } from '../campaignOffer/campaignOffer.constant';
import { CampaignOffer } from '../campaignOffer/campaignOffer.model';
import Follow from '../follow/follow.model';
import Reviewer from '../reviewer/reviewer.model';
import { IReview } from './review.interface';
import Review from './reviewer.model';

const createReview = async (reviewerId: string, payload: any) => {
  if (
    payload.totalCommissions ||
    payload.totalReferralSales ||
    payload.totalView
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not allowed to add this field',
    );
  }
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
  if (campaignOffer.campaign.status !== CampaignOfferStatus.accept) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This campaign not accepted by you',
    );
  }

  // TODO: when create review---------------
  if (payload.video) {
    console.log('video', payload.video);
    payload.video = getCloudFrontUrl(payload.video);
  }
  const result = await Review.create({
    ...payload,
    reviewer: reviewerId,
    campaign: campaignOffer.campaign._id,
    product: campaignOffer.product._id,
    category: campaignOffer.product.category,
    bussiness: campaignOffer.business,
    amount: campaignOffer.amount,
  });

  campaignOffer.status = CampaignOfferStatus.completed;
  await campaignOffer.save();
  return result;
};

const updateReviewerIntoDB = async (
  profileId: string,
  id: string,
  payload: Partial<IReview>,
) => {
  if (
    payload.totalCommissions ||
    payload.totalReferralSales ||
    payload.totalView ||
    payload.amount ||
    payload.campaign ||
    payload.category ||
    payload.product
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not allowed to update this field',
    );
  }
  const review = await Reviewer.findOne({ _id: id, reviewer: profileId });
  if (!review) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Reviewer not found or you are not authorized to update this reviewer',
    );
  }
  const result = await Reviewer.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllReviewFromDB = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  // If filtering by following is enabled → fetch all the people this reviewer follows
  let followingIds: Types.ObjectId[] = [];
  if (query.following === 'true') {
    const follows = await Follow.find({ follower: reviewerId }).select(
      'following',
    );
    followingIds = follows.map((f) => f.following as Types.ObjectId);
  }

  const matchStage: any = {};

  // Only include reviews from followed reviewers
  if (query.following === 'true') {
    matchStage.reviewer = { $in: followingIds };
  }

  if (query.category) {
    matchStage.category = new mongoose.Types.ObjectId(query.category as string);
  }
  if (query.product) {
    matchStage.product = new mongoose.Types.ObjectId(query.product as string);
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortStage =
    query.sortBy && query.sortOrder
      ? { [query.sortBy as string]: query.sortOrder === 'asc' ? 1 : -1 }
      : { createdAt: -1 };

  const pipeline: any[] = [
    { $match: matchStage },

    // Search
    ...(query.search
      ? [
          {
            $match: {
              description: { $regex: query.search as string, $options: 'i' },
            },
          },
        ]
      : []),

    {
      $facet: {
        meta: [
          { $count: 'total' },
          {
            $addFields: {
              page,
              limit,
              totalPage: {
                $ceil: { $divide: ['$total', limit] },
              },
            },
          },
        ],
        result: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },

          // Lookup product
          {
            $lookup: {
              from: 'products',
              localField: 'product',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: '$product' },

          // Lookup category
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },

          // Lookup reviewer
          {
            $lookup: {
              from: 'reviewers',
              localField: 'reviewer',
              foreignField: '_id',
              as: 'reviewer',
            },
          },
          { $unwind: '$reviewer' },

          // Add isFollow flag
          {
            $lookup: {
              from: 'follows',
              let: { reviewerId: '$reviewer._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$follower', new Types.ObjectId(reviewerId)] },
                        { $eq: ['$following', '$$reviewerId'] },
                      ],
                    },
                  },
                },
                { $limit: 1 },
              ],
              as: 'followCheck',
            },
          },
          {
            $addFields: {
              'reviewer.isFollow': { $gt: [{ $size: '$followCheck' }, 0] },
            },
          },
          { $project: { followCheck: 0 } },

          // Lookup comments
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'review',
              as: 'comments',
            },
          },

          {
            $addFields: {
              totalComments: { $size: '$comments' },
              isLike: {
                $in: [new Types.ObjectId(reviewerId), '$likers'],
              },
              isMyReview: {
                $eq: ['$reviewer._id', new Types.ObjectId(reviewerId)],
              },
              totalLikers: { $size: '$likers' },
            },
          },

          // Lookup likers
          {
            $lookup: {
              from: 'reviewers',
              let: { likerIds: '$likers' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$likerIds'] } } },
                { $sample: { size: 6 } },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    profile_image: 1,
                  },
                },
              ],
              as: 'likers',
            },
          },
          {
            $project: {
              _id: 1,
              reviewer: {
                _id: 1,
                name: 1,
                username: 1,
                profile_image: 1,
                isFollow: 1,
              },
              product: {
                _id: 1,
                name: 1,
                price: 1,
              },
              category: {
                _id: 1,
                name: 1,
              },
              campaign: 1,
              amount: 1,
              description: 1,
              images: 1,
              video: 1,
              thumbnail: 1,
              totalLikers: 1,
              rating: 1,
              createdAt: 1,
              updatedAt: 1,
              totalComments: 1,
              isLike: 1,
              isMyReview: 1,
              likers: 1,
            },
          },
        ],
      },
    },
  ];

  const result = await Review.aggregate(pipeline);

  const meta = result[0]?.meta?.[0] || { page, limit, total: 0, totalPage: 0 };
  const reviews = result[0]?.result || [];

  return {
    data: {
      meta,
      result: reviews,
    },
  };
};

const getMyReviews = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const matchStage: any = {
    reviewer: new mongoose.Types.ObjectId(reviewerId),
  };

  if (query.category) {
    matchStage.category = new mongoose.Types.ObjectId(query.category as string);
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sortStage =
    query.sortBy && query.sortOrder
      ? { [query.sortBy as string]: query.sortOrder === 'asc' ? 1 : -1 }
      : { createdAt: -1 };

  const pipeline: any[] = [
    { $match: matchStage },

    // Search
    ...(query.search
      ? [
          {
            $match: {
              description: { $regex: query.search as string, $options: 'i' },
            },
          },
        ]
      : []),

    {
      $facet: {
        meta: [
          { $count: 'total' },
          {
            $addFields: {
              page,
              limit,
              totalPage: {
                $ceil: { $divide: ['$total', limit] },
              },
            },
          },
        ],
        result: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },

          // Lookup product
          {
            $lookup: {
              from: 'products',
              localField: 'product',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: '$product' },

          // Lookup category
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          { $unwind: '$category' },

          // Lookup reviewer
          {
            $lookup: {
              from: 'reviewers',
              localField: 'reviewer',
              foreignField: '_id',
              as: 'reviewer',
            },
          },
          { $unwind: '$reviewer' },

          // Lookup comments to count
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'review',
              as: 'comments',
            },
          },

          {
            $addFields: {
              totalComments: { $size: '$comments' },
              isLike: {
                $in: [new Types.ObjectId(reviewerId), '$likers'],
              },
              isMyReview: {
                $eq: ['$reviewer._id', new Types.ObjectId(reviewerId)],
              },
              totalLikers: { $size: '$likers' },
            },
          },
          {
            $lookup: {
              from: 'reviewers', // or users collection
              let: { likerIds: '$likers' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$likerIds'] } } },
                { $sample: { size: 6 } }, // randomly pick up to 6 likers
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    profile_image: 1,
                  },
                },
              ],
              as: 'likers',
            },
          },
          {
            $project: {
              _id: 1,
              reviewer: {
                _id: 1,
                name: 1,
                username: 1,
                profile_image: 1,
              },
              product: {
                _id: 1,
                name: 1,
                price: 1,
                images: 1,
              },
              category: {
                _id: 1,
                name: 1,
                images: 1,
              },
              campaign: 1,
              amount: 1,
              description: 1,
              // images: 1,
              video: 1,
              thumbnail: 1,
              totalLikers: 1,
              rating: 1,
              totalView: 1,
              totalCommissions: 1,
              totalReferralSales: 1,
              createdAt: 1,
              updatedAt: 1,
              totalComments: 1,
              isLike: 1,
              isMyReview: 1,
              likers: 1,
            },
          },
        ],
      },
    },
  ];

  const result = await Review.aggregate(pipeline);

  const meta = result[0]?.meta?.[0] || { page, limit, total: 0, totalPage: 0 };
  const reviews = result[0]?.result || [];

  return {
    data: {
      meta,
      result: reviews,
    },
  };
};

// get my revies--------------------->>>>>
// const getMyReviews = async (
//   reviewerId: string,
//   query: Record<string, unknown>,
// ) => {
//   const reviewQuery = new QueryBuilder(
//     Review.find({ reviewer: reviewerId })
//       .populate({ path: 'product', select: 'name price' })
//       .populate({ path: 'category', select: 'name' })
//       .populate({ path: 'reviewer', select: 'name username profile_image' }),
//     query,
//   )
//     .search(['description'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   let reviews = await reviewQuery.modelQuery;
//   reviews = await Promise.all(
//     reviews.map(async (review: any) => {
//       const totalComments = await Comment.countDocuments({
//         reviewId: review._id,
//       });
//       const isLike = review.likers.some((liker: Types.ObjectId) =>
//         liker.equals(reviewerId),
//       );
//       return {
//         ...review.toObject(),
//         totalComments,
//         isLike,
//       };
//     }),
//   );
//   const meta = await reviewQuery.countTotal();

//   return {
//     meta,
//     result: reviews,
//   };
// };

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
    Reviewer.find({ _id: { $in: review.likers } }).select(
      'name profile_image username',
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

// const getSingleProductReview = async (
//   productId: string,
//   query: Record<string, unknown>,
// ) => {
//   const resultQuery = new QueryBuilder(
//     Review.find({ product: productId })
//       .select('reviewer createdAt rating description')
//       .populate({ path: 'product', select: 'name images' })
//       .populate({ path: 'reviewer', select: 'profile_image name' }),
//     query,
//   )
//     .search(['description'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await resultQuery.modelQuery;
//   const meta = await resultQuery.countTotal();
//   const avgRatingData = await Review.aggregate([
//     { $match: { product: new mongoose.Types.ObjectId(productId) } },
//     {
//       $group: {
//         _id: '$product',
//         averageRating: { $avg: '$rating' },
//       },
//     },
//   ]);

//   const averageRating =
//     avgRatingData.length > 0 ? avgRatingData[0].averageRating : 0;
//   return {
//     meta,
//     result,
//     averageRating,
//   };
// };

const getSingleProductReview = async (
  productId: string,
  query: Record<string, unknown>,
) => {
  const resultQuery = new QueryBuilder(
    Review.find({ product: productId })
      .select('reviewer createdAt rating description')
      .populate({ path: 'product', select: 'name images' })
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

  // Aggregation for average + star counts
  const ratingStats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        oneStar: {
          $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
        },
        twoStar: {
          $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
        },
        threeStar: {
          $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
        },
        fourStar: {
          $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
        },
        fiveStar: {
          $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
        },
      },
    },
  ]);

  const stats =
    ratingStats.length > 0
      ? ratingStats[0]
      : {
          averageRating: 0,
          oneStar: 0,
          twoStar: 0,
          threeStar: 0,
          fourStar: 0,
          fiveStar: 0,
        };

  return {
    meta,
    result,
    averageRating: stats.averageRating,
    starCounts: {
      oneStar: stats.oneStar,
      twoStar: stats.twoStar,
      threeStar: stats.threeStar,
      fourStar: stats.fourStar,
      fiveStar: stats.fiveStar,
    },
  };
};

const ReviewService = {
  createReview,
  getAllReviewFromDB,
  getReviewLikers,
  likeUnlikeReview,
  getMyReviews,
  getSingleProductReview,
  updateReviewerIntoDB,
};

export default ReviewService;
