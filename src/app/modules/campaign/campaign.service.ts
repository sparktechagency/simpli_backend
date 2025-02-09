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
} from '../../utilities/enum';
import config from '../../config';

const createCampaign = async (bussinessId: string, payload: ICampaign) => {
  const product = await Product.findById(payload.product);

  const totalAmount = payload.amountForEachReview * payload.numberOfReviewers;
  const amountInCents = totalAmount * 100;

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // check scheduled or not---
  const currentDate = new Date();
  if (currentDate < payload.startDate) {
    payload.status = CAMPAIGN_STATUS.SCHEDULED;
  }
  const result = await Campaign.create({
    ...payload,
    totalFee: totalAmount,
    bussiness: bussinessId,
  });
  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Campaign Run`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        campaignId: result._id.toString(),
        paymentPurpose: ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN,
      },
      success_url: `${config.stripe.stripe_campaign_run_payment_success_url}`,
      cancel_url: `${config.stripe.stripe_campaign_run_payment_cancel_url}`,
    });
    return { url: session.url };
  } else if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
    console.log('paypal payment');
  }
};

const CampaignService = {
  createCampaign,
};

export default CampaignService;
