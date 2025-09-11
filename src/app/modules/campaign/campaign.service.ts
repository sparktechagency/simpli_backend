/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import cron from 'node-cron';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import { platformFeeForCampaignParcentage } from '../../constant';
import AppError from '../../error/appError';
import {
  CAMPAIGN_STATUS,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
  ENUM_PAYMENT_STATUS,
  ENUM_PRODUCT_STATUS,
} from '../../utilities/enum';
import paypalClient from '../../utilities/paypal';
import stripe from '../../utilities/stripe';
import Product from '../product/product.model';
import { USER_ROLE } from '../user/user.constant';
import { ICampaign } from './campaign.interface';
import Campaign from './campaign.model';
const createCampaign = async (bussinessId: string, payload: ICampaign) => {
  const product = await Product.findById(payload.product);

  const reviewCost = payload.amountForEachReview * payload.numberOfReviewers;
  const adminFee = (reviewCost * platformFeeForCampaignParcentage) / 100;
  const totalAmount = reviewCost + adminFee;
  const amountInCents = totalAmount * 100;

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
            unit_amount: amountInCents,
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

// get campaigns
const getAllCampaignFromDB = async (query: Record<string, unknown>) => {
  const campaignQuery = new QueryBuilder(
    Campaign.find({ paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS }).populate(
      'product',
    ),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await campaignQuery.countTotal();
  const result = await campaignQuery.modelQuery;
  return {
    meta,
    result,
  };
};
const getMyCampaigns = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const campaignQuery = new QueryBuilder(
    Campaign.find({
      paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
      bussiness: profileId,
    }).populate('product'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await campaignQuery.countTotal();
  const result = await campaignQuery.modelQuery;
  return {
    meta,
    result,
  };
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

const CampaignService = {
  createCampaign,
  getAllCampaignFromDB,
  changeCampaignStatus,
  getSingleCampaignFromDB,
  updateCampaignIntoDB,
  getMyCampaigns,
};

export default CampaignService;
