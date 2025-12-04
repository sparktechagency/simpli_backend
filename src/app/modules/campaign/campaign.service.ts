/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config';
import {
  imageReviewCost,
  platformFeeForCampaignParcentage,
  videoReviewCost,
} from '../../constant';
import AppError from '../../error/appError';
import {
  CAMPAIGN_STATUS,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
  ENUM_PRODUCT_STATUS,
} from '../../utilities/enum';
import paypalClient from '../../utilities/paypal';
import stripe from '../../utilities/stripe';
import Product from '../product/product.model';
import Review from '../review/reviewer.model';
import Reviewer from '../reviewer/reviewer.model';
import { Store } from '../store/store.model';
import { USER_ROLE } from '../user/user.constant';
import { ENUM_REVIEW_TYPE } from './campaign.enum';
import validateDateRange from './campaign.helper';
import { CampaignSummary, ICampaign } from './campaign.interface';
import Campaign from './campaign.model';
const createCampaign = async (bussinessId: string, payload: ICampaign) => {
  const store = await Store.findOne({ bussiness: bussinessId });
  if (!store) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Before creating any campaign you need to add your store details',
    );
  }
  const product = await Product.findById(payload.product);
  let amountForEachReview;

  if (payload.reviewType && payload.reviewType == ENUM_REVIEW_TYPE.video) {
    amountForEachReview = videoReviewCost;
  } else {
    amountForEachReview = imageReviewCost;
  }

  const reviewCost = amountForEachReview * payload.numberOfReviewers;
  const adminFee = (reviewCost * platformFeeForCampaignParcentage) / 100;
  const totalAmount = reviewCost + adminFee;
  const amountInCents = (totalAmount * 100).toFixed(2);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.status !== ENUM_PRODUCT_STATUS.ACTIVE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Need to chose a active product for campaign',
    );
  }

  // Check if campaign is scheduled
  const currentDate = new Date();
  if (currentDate < new Date(payload.startDate)) {
    payload.status = CAMPAIGN_STATUS.SCHEDULED;
  }

  if (!validateDateRange(payload.startDate, payload.endDate)) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      'The duration between startDate and endDate must be at least 3 weeks (21 days).',
    );
  }

  // Create campaign in DB (without payment yet)
  const result = await Campaign.create({
    ...payload,
    totalFee: totalAmount,
    bussiness: bussinessId,
    totalBugget: reviewCost,
  });

  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
    // Handle Stripe Payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Campaign Run' },
            unit_amount: Number(amountInCents),
          },
          quantity: 1,
        },
      ],
      metadata: {
        campaignId: result._id.toString(),
        paymentPurpose: ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN,
      },
      success_url: config.stripe.stripe_campaign_run_payment_success_url,
      cancel_url: config.stripe.stripe_campaign_run_payment_cancel_url,
    });

    return { url: session.url };
  }

  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: totalAmount.toFixed(2),
            },
            description: `Payment for Campaign: ${result._id}`,
            custom_id: result._id.toString(),
            reference_id: ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN,
          },
        ],
        application_context: {
          brand_name: 'Your Business Name',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: `${config.paypal.payment_capture_url}`,
          cancel_url: `${config.paypal.paypal_campaign_run_payment_cancel_url}`,
        },
      });

      const response = await paypalClient.execute(request);
      const approvalUrl = response.result.links.find(
        (link: any) => link.rel === 'approve',
      )?.href;

      if (!approvalUrl) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'PayPal payment creation failed: No approval URL found',
        );
      }

      return { url: approvalUrl };
    } catch (error) {
      console.error('PayPal Payment Error:', error);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create PayPal order',
      );
    }
  }
};

// update campaign
const updateCampaignIntoDB = async (
  bussinessId: string,
  id: string,
  payload: Partial<ICampaign>,
) => {
  const campaign = await Campaign.findOne({ bussiness: bussinessId, _id: id });
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }
  if (campaign.status === CAMPAIGN_STATUS.CANCELLED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Your can't edit cancelled campaign",
    );
  }
  if (payload.startDate && payload.endDate) {
    if (new Date(payload.startDate) > new Date(payload.endDate)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Start date can not be grater then end date',
      );
    }
  } else if (payload.startDate) {
    if (new Date(payload.startDate) > campaign.endDate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Start date can not be grater then end date',
      );
    }
    if (new Date(payload.startDate) > new Date()) {
      payload.status = CAMPAIGN_STATUS.SCHEDULED;
    }
  } else if (payload.endDate) {
    if (new Date(payload.endDate) < campaign.startDate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'End date can not be less then start date',
      );
    }
  }

  const result = await Campaign.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// const getAllCampaignFromDB = async (
//   query: Record<string, any>,
//   userId: string,
// ) => {
//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;
//   const skip = (page - 1) * limit;

//   const pipeline: any[] = [
//     {
//       $match: {
//         paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
//       },
//     },
//     // join with product (pick only required fields)
//     {
//       $lookup: {
//         from: 'products',
//         localField: 'product',
//         foreignField: '_id',
//         as: 'product',
//         pipeline: [
//           {
//             $project: {
//               _id: 1,
//               name: 1,
//               images: 1,
//               shortDescription: 1,
//             },
//           },
//         ],
//       },
//     },
//     { $unwind: '$product' },

//     // join with CampaignOffer (filtered by userId)
//     {
//       $lookup: {
//         from: 'campaignoffers',
//         let: { campaignId: '$_id', productId: '$product._id' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ['$campaign', '$$campaignId'] },
//                   { $eq: ['$product', '$$productId'] },
//                   { $eq: ['$reviewer', new mongoose.Types.ObjectId(userId)] },
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 0,
//               status: 1,
//               deliveryStatus: 1,
//             },
//           },
//         ],
//         as: 'userOffer',
//       },
//     },
//     {
//       $addFields: {
//         userOffer: { $arrayElemAt: ['$userOffer', 0] },
//       },
//     },

//     // pagination with facet
//     {
//       $facet: {
//         meta: [
//           { $count: 'total' },
//           {
//             $addFields: {
//               page,
//               limit,
//               totalPage: {
//                 $ceil: {
//                   $divide: ['$total', limit],
//                 },
//               },
//             },
//           },
//         ],
//         result: [{ $skip: skip }, { $limit: limit }],
//       },
//     },
//     {
//       $project: {
//         meta: { $arrayElemAt: ['$meta', 0] },
//         result: 1,
//       },
//     },
//   ];

//   const data = await Campaign.aggregate(pipeline);
//   return data[0] || { meta: {}, result: [] };
// };

const getAllCampaignFromDB = async (
  query: Record<string, any>,
  userId: string,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const reviewer = await Reviewer.findById(userId)
    .select('city state country')
    .lean();
  if (!reviewer) throw new Error('Reviewer not found');
  console.log('reviewer', reviewer);
  const pipeline: any[] = [
    // 1️⃣ Filter by payment success + location logic
    {
      $match: {
        $expr: {
          $or: [
            { $eq: ['$isShowEverywhere', true] }, // show everywhere
            {
              $and: [
                { $eq: ['$country', reviewer.country || ''] },

                // State check
                {
                  $or: [
                    { $eq: [{ $size: '$state' }, 0] }, // empty → allow
                    { $in: [reviewer.state, '$state'] }, // string in array
                  ],
                },

                // City check
                {
                  $or: [
                    { $eq: [{ $size: '$city' }, 0] }, // empty → allow
                    { $in: [reviewer.city, '$city'] }, // string in array
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    // 2️⃣ Join with Product
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product',
        pipeline: [
          { $project: { _id: 1, name: 1, images: 1, shortDescription: 1 } },
        ],
      },
    },
    { $unwind: '$product' },

    // 3️⃣ Join with CampaignOffer filtered by reviewer
    {
      $lookup: {
        from: 'campaignoffers',
        let: { campaignId: '$_id', productId: '$product._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$campaign', '$$campaignId'] },
                  { $eq: ['$product', '$$productId'] },
                  { $eq: ['$reviewer', new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
          { $project: { _id: 0, status: 1, deliveryStatus: 1 } },
        ],
        as: 'userOffer',
      },
    },
    {
      $addFields: {
        userOffer: { $arrayElemAt: ['$userOffer', 0] },
      },
    },

    // 4️⃣ Pagination
    {
      $facet: {
        meta: [
          { $count: 'total' },
          {
            $addFields: {
              page,
              limit,
              totalPage: { $ceil: { $divide: ['$total', limit] } },
            },
          },
        ],
        result: [{ $skip: skip }, { $limit: limit }],
      },
    },
    {
      $project: {
        meta: { $arrayElemAt: ['$meta', 0] },
        result: 1,
      },
    },
  ];

  const data = await Campaign.aggregate(pipeline);
  return data[0] || { meta: {}, result: [] };
};

const getMyCampaigns = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const searchTerm = query.searchTerm || '';
  const status = query.status || '';

  const matchStage: any = {
    bussiness: new mongoose.Types.ObjectId(profileId),
  };

  if (status) {
    matchStage.status = status;
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      throw new Error('Invalid business ID format');
    }

    const pipeline: any = [
      { $match: matchStage },
      ...(searchTerm
        ? [
            {
              $match: {
                name: { $regex: searchTerm, $options: 'i' },
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'campaign',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          totalReviews: { $size: '$reviews' },
          totalAmountOfReviews: {
            $sum: '$reviews.amount',
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          campaigns: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                name: 1,
                startDate: 1,
                endDate: 1,
                status: 1,
                totalBugget: 1,
                numberOfReviewers: 1,
                progress: {
                  $concat: [
                    { $toString: '$totalReviews' },
                    '/',
                    { $toString: '$numberOfReviewers' },
                  ],
                },
                product: {
                  name: 1,
                  images: 1,
                },
                totalReviews: 1,
                totalAmountOfReviews: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: '$metadata',
      },
      {
        $project: {
          meta: {
            page: page,
            limit: limit,
            total: '$metadata.total',
            totalPage: { $ceil: { $divide: ['$metadata.total', limit] } },
          },
          result: '$campaigns',
        },
      },
    ];

    const result = await Campaign.aggregate(pipeline).exec();

    // return result[0]

    return {
      meta: {
        page: result[0]?.meta?.page || page,
        limit: result[0]?.meta?.limit || limit,
        total: result[0]?.meta?.total || 0,
        totalPage: result[0]?.meta?.totalPage || 0,
      },
      result: result[0]?.result || [],
    };
  } catch (error) {
    console.error(
      'Error fetching paginated campaign data using facet and search:',
      error,
    );
    throw error;
  }
};

// get single campaign
// TODO : need to work for bussiness owner for get campaign overview
const getSingleCampaignFromDB = async (id: string, userData: JwtPayload) => {
  if (userData?.role === USER_ROLE.bussinessOwner) {
    const result = await Campaign.findOne({
      _id: id,
      bussiness: userData?.profileId,
    }).populate('product');
    return result;
  } else {
    const result = await Campaign.findById(id).populate('product');
    return result;
  }
};

// change campaign status

const changeCampaignStatus = async (
  bussinessId: string,
  id: string,
  status: string,
) => {
  let result;
  if (status === CAMPAIGN_STATUS.PAUSED) {
    result = await pauseCampaign(bussinessId, id, status);
  } else if (status === CAMPAIGN_STATUS.CANCELLED) {
    result = await cancelCampaign(bussinessId, id, status);
  } else if (status === CAMPAIGN_STATUS.ACTIVE) {
    result = await makeCampaignActive(bussinessId, id, status);
  }
  return result;
};

const pauseCampaign = async (
  bussinessId: string,
  id: string,
  status: string,
) => {
  const campaign = await Campaign.findOne({ _id: id, bussiness: bussinessId });
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }
  if (campaign.status != CAMPAIGN_STATUS.ACTIVE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Only active campaign can be paused',
    );
  }
  const result = await Campaign.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );
  return result;
};
const makeCampaignActive = async (
  bussinessId: string,
  id: string,
  status: string,
) => {
  const campaign = await Campaign.findOne({ _id: id, bussiness: bussinessId });
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }
  if (campaign.status != CAMPAIGN_STATUS.PAUSED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Only paused campaign can be activated',
    );
  }
  if (new Date() > campaign?.endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Your campaign end date is expired please update end date then make active',
    );
  }
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }
  const result = await Campaign.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );
  return result;
};

// chancel campaign--------------------------------
const cancelCampaign = async (
  bussinessId: string,
  id: string,
  status: string,
) => {
  const campaign = await Campaign.findOne({ _id: id, bussiness: bussinessId });
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }
  //TODO: need to do database operation with review
  const totalReviewCount = 10;
  const amountForEachReview = campaign.amountForEachReview;
  const totalSpent = totalReviewCount * amountForEachReview;
  const refundAmount = campaign.totalBugget - totalSpent;

  if (campaign.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
    if (!campaign.paymentIntentId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No payment intent found for this campaign',
      );
    }

    try {
      const refund = await stripe.refunds.create({
        payment_intent: campaign.paymentIntentId,
        amount: Math.round(refundAmount * 100),
      });

      console.log('Refund successful:', refund.id);

      const result = await Campaign.findByIdAndUpdate(
        id,
        { status: status },
        { new: true, runValidators: true },
      );
      return result;

      return refund;
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to process refund',
      );
    }
  } else if (campaign.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
    //TODO: paypal refund need
    console.log('paypal refund');
  }
};

// crone jobs for campaign --------------------

cron.schedule('0 0 * * *', async () => {
  console.log('Cron job executed at:', new Date());

  const currentDate = new Date();
  const result = await Campaign.updateMany(
    { startDate: { $lte: currentDate }, status: { $ne: 'Active' } },
    { $set: { status: 'Active' } },
  );
  const result2 = await Campaign.updateMany(
    {
      endDate: { $lte: currentDate },
    },
    { $set: { status: CAMPAIGN_STATUS.EXPIRED } },
  );

  console.log(`Campaigns updated to active: ${result.modifiedCount}`);
  console.log(`Campaigns updated to expired: ${result2.modifiedCount}`);
});

const getCampaignSummary = async (
  profileId: string,
  campaignId: string,
): Promise<CampaignSummary> => {
  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    throw Object.assign(new Error('Invalid campaign id'), { statusCode: 400 });
  }
  //!TODO: need to check bussiness owner
  const campaign = await Campaign.findOne({
    _id: campaignId,
    // bussiness: profileId,
  })
    .select([
      '_id',
      'name',
      'startDate',
      'endDate',
      'status',
      'numberOfReviewers',
      'totalBugget',
    ])
    .lean();

  if (!campaign) {
    throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  }

  const [agg] = await Review.aggregate<{
    reviewsCompleted: number;
    totalSpent: number;
    averageRating: number;
  }>([
    { $match: { campaign: new mongoose.Types.ObjectId(campaignId) } },
    {
      $group: {
        _id: '$campaign',
        reviewsCompleted: { $sum: 1 },
        totalSpent: { $sum: { $ifNull: ['$amount', 0] } },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const reviewsCompleted = agg?.reviewsCompleted ?? 0;
  const totalSpent = Number(agg?.totalSpent ?? 0);
  const averageRating =
    typeof agg?.averageRating === 'number'
      ? Number(agg.averageRating.toFixed(2))
      : null;

  const target = Number(campaign.numberOfReviewers ?? 0);
  const percent =
    target > 0 ? Math.min(100, (reviewsCompleted / target) * 100) : 0;

  const now = new Date();
  const end = new Date(campaign.endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / msPerDay),
  );

  const totalBudget = Number(campaign.totalBugget ?? 0);
  const remaining = Math.max(0, totalBudget - totalSpent);

  return {
    id: String(campaign._id),
    name: campaign.name,
    timeline: {
      startDate: new Date(campaign.startDate).toISOString(),
      endDate: end.toISOString(),
    },
    budget: {
      spent: totalSpent,
      total: totalBudget,
      remaining,
    },
    status: campaign.status,
    progress: {
      completed: reviewsCompleted,
      target,
      percent: Number(percent.toFixed(2)),
    },
    totals: {
      reviewsCompleted,
      totalSpent,
      averageRating,
    },
    daysRemaining,
  };
};

// get performance

export type PerformanceFilter = 'this-week' | 'this-month' | 'this-year';

export type CampaignPerformancePoint = {
  key: string; // stable key for chart x-axis
  label: string; // Mon | 1-5 | Jan
  periodStart: string; // ISO start of bucket
  periodEnd: string; // ISO end of bucket (exclusive)
  reviews: number; // count
  spent: number; // sum(Review.amount)
  averageRating: number | null; // avg(Review.rating) rounded(2) or null
};

const ONE_DAY_MS = 86_400_000;
const iso = (d: Date) => d.toISOString();
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * ONE_DAY_MS);
const addMonths = (d: Date, n: number) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1, 0, 0, 0, 0));
const startOfMonthUTC = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const startOfYearUTC = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
const lastDayOfMonth = (y: number, m0: number) =>
  new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate(); // 28–31

// Monday=1 … Sunday=7; compute the Monday of "this week" (UTC)
const mondayStartOfThisWeekUTC = (nowUTC: Date) => {
  const day = nowUTC.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const d = new Date(
    Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate(),
    ),
  );
  const monday = addDays(d, diffToMonday);
  return new Date(
    Date.UTC(
      monday.getUTCFullYear(),
      monday.getUTCMonth(),
      monday.getUTCDate(),
    ),
  );
};

export const getCampaignPerformance = async (
  campaignId: string,
  filter: PerformanceFilter,
  timezone?: string,
): Promise<CampaignPerformancePoint[]> => {
  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    throw Object.assign(new Error('Invalid campaign id'), { statusCode: 400 });
  }

  const tz = timezone ?? 'UTC';
  const now = new Date();

  type Plan = {
    rangeStart: Date;
    rangeEnd: Date;
    mongoGroupStage: any[]; // stages to compute bucket stats
    expectedBuckets: { key: string; label: string; start: Date; end: Date }[];
  };

  const plan: Plan = (() => {
    if (filter === 'this-week') {
      const start = mondayStartOfThisWeekUTC(now);
      const end = addDays(start, 7);
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      const expected = Array.from({ length: 7 }).map((_, i) => {
        const s = addDays(start, i);
        const e = addDays(s, 1);
        return { key: iso(s), label: labels[i], start: s, end: e };
      });

      return {
        rangeStart: start,
        rangeEnd: end,
        mongoGroupStage: [
          {
            $addFields: {
              bucket: {
                $dateTrunc: { date: '$createdAt', unit: 'day', timezone: tz },
              },
            },
          },
          {
            $group: {
              _id: '$bucket',
              reviews: { $sum: 1 },
              spent: { $sum: { $ifNull: ['$amount', 0] } },
              averageRating: { $avg: '$rating' },
            },
          },
          {
            $project: {
              _id: 0,
              bucket: '$_id',
              reviews: 1,
              spent: 1,
              averageRating: 1,
            },
          },
        ],
        expectedBuckets: expected,
      };
    }

    if (filter === 'this-month') {
      const start = startOfMonthUTC(now);
      const end = addMonths(start, 1);

      // 6 bins: 1-5, 6-10, 11-15, 16-20, 21-25, 26-(end)
      const y = start.getUTCFullYear();
      const m = start.getUTCMonth();
      const endDay = lastDayOfMonth(y, m);
      const bins = [
        [1, 5],
        [6, 10],
        [11, 15],
        [16, 20],
        [21, 25],
        [26, endDay],
      ] as const;

      const expected = bins.map(([a, b]) => {
        const s = new Date(Date.UTC(y, m, a));
        const e = new Date(Date.UTC(y, m, b + 1)); // exclusive end
        return { key: `${y}-${m}-${a}`, label: `${a}-${b}`, start: s, end: e };
      });

      // Compute bin 1..6 from day-of-month (TZ-aware)
      const groupStages = [
        {
          $addFields: {
            monthStart: {
              $dateTrunc: { date: '$createdAt', unit: 'month', timezone: tz },
            },
            dom: { $dayOfMonth: { date: '$createdAt', timezone: tz } },
          },
        },
        {
          $addFields: {
            bin: {
              $let: {
                vars: { d: '$dom' },
                in: {
                  $cond: [
                    { $lte: ['$$d', 25] },
                    { $ceil: { $divide: ['$$d', 5] } }, // 1..5=>1, 6..10=>2, ..., 21..25=>5
                    6, // 26..end => 6
                  ],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: { monthStart: '$monthStart', bin: '$bin' },
            reviews: { $sum: 1 },
            spent: { $sum: { $ifNull: ['$amount', 0] } },
            averageRating: { $avg: '$rating' },
          },
        },
        {
          $project: {
            _id: 0,
            monthStart: '$_id.monthStart',
            bin: '$_id.bin',
            reviews: 1,
            spent: 1,
            averageRating: 1,
          },
        },
      ];

      return {
        rangeStart: start,
        rangeEnd: end,
        mongoGroupStage: groupStages,
        expectedBuckets: expected,
      };
    }

    // this-year
    const start = startOfYearUTC(now);
    const end = addMonths(start, 12);
    const monthLabels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const expected = Array.from({ length: 12 }).map((_, i) => {
      const s = addMonths(start, i);
      const e = addMonths(s, 1);
      return {
        key: `${s.getUTCFullYear()}-${i + 1}`,
        label: monthLabels[i],
        start: s,
        end: e,
      };
    });

    return {
      rangeStart: start,
      rangeEnd: end,
      mongoGroupStage: [
        {
          $addFields: {
            bucket: {
              $dateTrunc: { date: '$createdAt', unit: 'month', timezone: tz },
            },
          },
        },
        {
          $group: {
            _id: '$bucket',
            reviews: { $sum: 1 },
            spent: { $sum: { $ifNull: ['$amount', 0] } },
            averageRating: { $avg: '$rating' },
          },
        },
        {
          $project: {
            _id: 0,
            bucket: '$_id',
            reviews: 1,
            spent: 1,
            averageRating: 1,
          },
        },
      ],
      expectedBuckets: expected,
    };
  })();

  // aggregate
  const match = {
    campaign: new mongoose.Types.ObjectId(campaignId),

    createdAt: { $gte: plan.rangeStart, $lt: plan.rangeEnd },
  };

  const agg = await Review.aggregate<any>([
    { $match: match },
    ...plan.mongoGroupStage,
  ]);

  // zero-fill + merge
  const map = new Map<string, CampaignPerformancePoint>();

  for (const b of plan.expectedBuckets) {
    map.set(b.key, {
      key: b.key,
      label: b.label,
      periodStart: iso(b.start),
      periodEnd: iso(b.end),
      reviews: 0,
      spent: 0,
      averageRating: null,
    });
  }

  if (filter === 'this-week' || filter === 'this-year') {
    for (const r of agg) {
      const bucket = new Date(r.bucket);
      const key =
        filter === 'this-week'
          ? iso(bucket)
          : `${bucket.getUTCFullYear()}-${bucket.getUTCMonth() + 1}`;
      const slot = map.get(key);
      if (slot) {
        slot.reviews = r.reviews ?? 0;
        slot.spent = Number(r.spent ?? 0);
        slot.averageRating =
          typeof r.averageRating === 'number'
            ? Number(r.averageRating.toFixed(2))
            : null;
      }
    }
  } else {
    // this-month (bins 1..6)
    for (const r of agg) {
      const monthStart = new Date(r.monthStart);
      const y = monthStart.getUTCFullYear();
      const m = monthStart.getUTCMonth();
      const binIndex = r.bin as number; // 1..6
      const startDay = binIndex <= 5 ? (binIndex - 1) * 5 + 1 : 26;
      const key = `${y}-${m}-${startDay}`;
      const slot = map.get(key);
      if (slot) {
        slot.reviews = r.reviews ?? 0;
        slot.spent = Number(r.spent ?? 0);
        slot.averageRating =
          typeof r.averageRating === 'number'
            ? Number(r.averageRating.toFixed(2))
            : null;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.periodStart < b.periodStart ? -1 : 1,
  );
};

const getCampaignStats = async (businessId: string) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    throw Object.assign(new Error('Invalid business id'), { statusCode: 400 });
  }

  const campaignAggregation = await Campaign.aggregate([
    {
      $match: { bussiness: new mongoose.Types.ObjectId(businessId) },
    },
    {
      $facet: {
        totalCampaigns: [{ $count: 'total' }],
        totalSpent: [
          { $group: { _id: null, totalSpent: { $sum: '$totalBugget' } } },
        ],
        activeCampaigns: [
          { $match: { status: CAMPAIGN_STATUS.ACTIVE } },
          { $count: 'activeCampaigns' },
        ],
      },
    },
  ]);

  const { totalCampaigns, totalSpent, activeCampaigns } =
    campaignAggregation[0];

  // Total Campaigns
  const totalCampaignsCount =
    totalCampaigns.length > 0 ? totalCampaigns[0].total : 0;

  // Total Spent
  const totalSpentAmount = totalSpent.length > 0 ? totalSpent[0].totalSpent : 0;

  // Active Campaigns
  const activeCampaignCount =
    activeCampaigns.length > 0 ? activeCampaigns[0].activeCampaigns : 0;

  // Average Rating for active campaigns
  const reviewsAggregation = await Review.aggregate([
    { $match: { campaign: { $in: activeCampaigns.map((c: any) => c._id) } } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } },
  ]);

  const averageRating =
    reviewsAggregation.length > 0 ? reviewsAggregation[0].averageRating : null;

  return {
    totalCampaigns: totalCampaignsCount,
    totalSpent: totalSpentAmount,
    activeCampaigns: activeCampaignCount,
    averageRating: averageRating,
  };
};

const CampaignService = {
  createCampaign,
  getAllCampaignFromDB,
  changeCampaignStatus,
  getSingleCampaignFromDB,
  updateCampaignIntoDB,
  getMyCampaigns,
  getCampaignSummary,
  getCampaignPerformance,
  getCampaignStats,
};

export default CampaignService;
