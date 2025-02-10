import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Product from '../product/product.model';
import { ICampaign } from './campaign.interface';
import Campaign from './campaign.model';
import stripe from '../../utilities/stripe';
import {
  CAMPAIGN_STATUS,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
  ENUM_PRODUCT_STATUS,
} from '../../utilities/enum';
import config from '../../config';
import paypal from '../../utilities/paypal';
import { platformFeeForCampaignParcentage } from '../../constant';

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
  } else if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
    const createPayment = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      redirect_urls: {
        return_url: `${config.paypal.paypal_campaign_run_payment_success_url}`,
        cancel_url: `${config.paypal.paypal_campaign_run_payment_cancel_url}`,
      },
      transactions: [
        {
          amount: { total: totalAmount.toFixed(2), currency: 'USD' },
          description: `Payment for Campaign: ${result._id}`,
          custom: JSON.stringify({
            campaignId: result._id.toString(),
            paymentPurpose: ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN,
          }),
        },
      ],
    };

    return new Promise((resolve, reject) => {
      paypal.payment.create(createPayment, (error, payment) => {
        if (error) {
          console.error('PayPal Payment Error:', error.response);
          reject(
            new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'PayPal payment creation failed',
            ),
          );
          return;
        }

        // Ensure payment object exists
        if (!payment || !payment.links) {
          console.error('PayPal payment creation failed: Missing links');
          reject(
            new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'PayPal payment creation failed: No approval URL',
            ),
          );
          return;
        }

        // Find the approval URL safely
        const approvalUrl = payment.links.find(
          (link) => link.rel === 'approval_url',
        )?.href;

        if (!approvalUrl) {
          console.error('No approval URL found in PayPal response');
          reject(
            new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'PayPal payment creation failed: No approval URL found',
            ),
          );
          return;
        }

        resolve({ url: approvalUrl });
      });
    });
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
    Campaign.find().populate('product'),
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

import cron from 'node-cron';
import QueryBuilder from '../../builder/QueryBuilder';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';

cron.schedule('0 0 * * *', async () => {
  console.log('Cron job executed at:', new Date());

  const currentDate = new Date();
  const result = await Campaign.updateMany(
    { startDate: { $lte: currentDate }, status: { $ne: 'Active' } },
    { $set: { status: 'Active' } },
  );
  console.log(`Campaigns updated: ${result.modifiedCount}`);
});

const CampaignService = {
  createCampaign,
  getAllCampaignFromDB,
  changeCampaignStatus,
  getSingleCampaignFromDB,
  updateCampaignIntoDB,
};

export default CampaignService;
