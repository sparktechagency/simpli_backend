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
import paypal from '../../utilities/paypal';
import { platformFeeForCampaignParcentage } from '../../constant';

// const createCampaign = async (bussinessId: string, payload: ICampaign) => {
//   const product = await Product.findById(payload.product);

//   const totalAmount = payload.amountForEachReview * payload.numberOfReviewers;
//   const amountInCents = totalAmount * 100;

//   if (!product) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
//   }

//   // check scheduled or not---
//   const currentDate = new Date();
//   if (currentDate < payload.startDate) {
//     payload.status = CAMPAIGN_STATUS.SCHEDULED;
//   }
//   const result = await Campaign.create({
//     ...payload,
//     totalFee: totalAmount,
//     bussiness: bussinessId,
//   });
//   if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: `Campaign Run`,
//             },
//             unit_amount: amountInCents,
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         campaignId: result._id.toString(),
//         paymentPurpose: ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN,
//       },
//       success_url: `${config.stripe.stripe_campaign_run_payment_success_url}`,
//       cancel_url: `${config.stripe.stripe_campaign_run_payment_cancel_url}`,
//     });
//     return { url: session.url };
//   } else if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
//     console.log('paypal payment');
//   }
// };

const createCampaign = async (bussinessId: string, payload: ICampaign) => {
  const product = await Product.findById(payload.product);

  const reviewCost = payload.amountForEachReview * payload.numberOfReviewers;
  const adminFee = reviewCost * platformFeeForCampaignParcentage;
  const totalAmount = reviewCost + adminFee;
  const amountInCents = totalAmount * 100;

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
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

// crone jobs for campaign --------------------

import cron from 'node-cron';

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
};

export default CampaignService;
