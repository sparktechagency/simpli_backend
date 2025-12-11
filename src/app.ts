/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import {
  generateMultiplePresignedUrls,
  generatePresignedUrl,
} from './app/aws/presignedUrlGenerator';
import AppError from './app/error/appError';
import capturePayPalPayment from './app/handlePaypal/capturePaypalPayment';
import handlePaypalWebhook from './app/handlePaypal/handlePaypalWebhook';
import handleConnectedAccountWebhook from './app/handleStripe/connectedAccountWebhook';
import onboardingRefresh from './app/handleStripe/onboardingRefresh';
import handleWebhook from './app/handleStripe/webhook';
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import { handleShippoWebhook } from './app/shippo/handleShippoWebhook';
import stripe from './app/utilities/stripe';
const app: Application = express();
// parser
app.post(
  '/sampli-webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook,
);
app.post(
  '/sampli-webhook-connected-account',
  express.raw({ type: 'application/json' }),
  handleConnectedAccountWebhook,
);
app.post(
  '/webhook-shippo',
  express.raw({ type: 'application/json' }),
  handleShippoWebhook,
  // async (req, res) => {
  //   try {
  //     // const event = req.body;
  //     const event = JSON.parse(req.body.toString());
  //     // console.log('Shippo webhook:', event);

  //     if (
  //       event.event === 'transaction_created' &&
  //       event.data.status === 'SUCCESS'
  //     ) {
  //       console.log('everne dtaa shippo', event.data);
  //       const transactionId = event.data.object_id;
  //       const transaction = await shippo.transactions.get(transactionId);
  //       // Find order that has this transaction
  //       const order: any = await Order.findOne({
  //         'shipping.shippoTransactionId': transactionId,
  //       });
  //       if (order) {
  //         // return res.status(200).send('Order not found, ignoring.');
  //         console.log('Order found.');
  //         // Update order with label + tracking info
  //         order.shipping = {
  //           ...order.shipping,
  //           status: 'PURCHASED',
  //           trackingNumber: transaction.trackingNumber,
  //           labelUrl: transaction.labelUrl,
  //           trackingUrl: transaction.trackingUrlProvider,
  //         };

  //         await order.save();
  //         // console.log(`Order ${order._id} updated with tracking info`);
  //       }

  //       const campaignOffer: any = await CampaignOffer.findOne({
  //         'shipping.shippoTransactionId': transactionId,
  //       });
  //       if (campaignOffer) {
  //         campaignOffer.shipping = {
  //           ...campaignOffer.shipping,
  //           status: 'PURCHASED',
  //           trackingNumber: transaction.trackingNumber,
  //           labelUrl: transaction.labelUrl,
  //           trackingUrl: transaction.trackingUrlProvider,
  //         };

  //         await campaignOffer.save();
  //         console.log(
  //           `Campaign offer ${campaignOffer._id} updated with tracking info`,
  //         );
  //       }
  //     }

  //     if (event.event === 'track_updated') {
  //       const tracking = event.data;
  //       console.log('Track update event:', tracking);
  //       const trackingNumber = tracking.tracking_number;

  //       const order = await Order.findOne({
  //         'shipping.trackingNumber': trackingNumber,
  //       });

  //       if (order && tracking.tracking_status.status) {
  //         await Order.findOneAndUpdate(
  //           { 'shipping.trackingNumber': trackingNumber },
  //           { $set: { 'shipping.status': tracking.tracking_status.status } },
  //           { new: true },
  //         );
  //         console.log(
  //           `Order ${order._id} updated to ${tracking.tracking_status.status}`,
  //         );
  //       }
  //       const campaignOffer: any = await CampaignOffer.findOne({
  //         'shipping.trackingNumber': trackingNumber,
  //       });

  //       if (campaignOffer && tracking.tracking_status.status) {
  //         await CampaignOffer.findOneAndUpdate(
  //           { 'shipping.trackingNumber': trackingNumber },
  //           { $set: { 'shipping.status': tracking.tracking_status.status } },
  //           { new: true },
  //         );
  //         console.log(
  //           `Order ${campaignOffer._id} updated to ${tracking.tracking_status.status}`,
  //         );
  //       }
  //     }

  //     res.status(200).send('ok');
  //   } catch (err) {
  //     console.error('Shippo webhook error:', err);
  //     res.status(500).send('Webhook handling failed');
  //   }
  // },
);
router.post('/paypal-webhook', express.json(), handlePaypalWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use(
  cors({
    origin: [
      'http://dashboard.sampli.io',
      'https://sampli.io',
      'https://dashboard.sampli.io',
      'https://dashboard.sampli.io',
      'https://sampli-dashbaord.vercel.app',
      'http://localhost:3000',
    ],
    // origin: '*',
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

// onboarding refresh --------------
router.get('/stripe/onboarding/refresh', onboardingRefresh);

app.get('/capture-payment', capturePayPalPayment);

// for s3 bucket--------------
app.post('/generate-presigned-url', async (req, res) => {
  const { fileType, fileCategory } = req.body;
  if (!fileType || !fileCategory) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'File type and file category is required',
    );
  }

  try {
    const result = await generatePresignedUrl({ fileType, fileCategory });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating pre-signed URL' });
  }
});

app.post('/generate-multiple-presigned-urls', async (req, res) => {
  const { files } = req.body;

  try {
    const result = await generateMultiplePresignedUrls(files);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error generating multiple pre-signed URLs',
    });
  }
});

app.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Test Product',
            },
            unit_amount: 5000, // 50.00 EUR
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
