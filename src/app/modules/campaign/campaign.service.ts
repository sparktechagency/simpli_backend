import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Product from '../product/product.model';
import { ICampaign } from './campaign.interface';
import Campaign from './campaign.model';
import stripe from '../../utilities/stripe';
import { ENUM_PAYMENT_PURPOSE } from '../../utilities/enum';

const createCampaign = async (bussinessId: string, payload: ICampaign) => {
  const product = await Product.findById(payload.product);

  const totalAmount = payload.amountForEachReview * payload.numberOfReviewers;
  const amountInCents = totalAmount * 100;

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product is required');
  }

  const result = await Campaign.create(payload);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Campaign Run`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: result._id.toString(),
      paymentPurpose: ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN,
    },
    success_url: `${config.stripe.booking_payment_success_url}`,
    cancel_url: `${config.stripe.payment_cancel_url}`,
  });

  // console.log('return url', session.url);
  return { url: session.url };
  return result;
};

const CampaignService = {
  createCampaign,
};

export default CampaignService;
