/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
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
import auth from './app/middlewares/auth';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import Bussiness from './app/modules/bussiness/bussiness.model';
import { CampaignOffer } from './app/modules/campaignOffer/campaignOffer.model';
import { Order } from './app/modules/order/order.model';
import { USER_ROLE } from './app/modules/user/user.constant';
import router from './app/routes';
import shippo from './app/utilities/shippo';
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

  async (req, res) => {
    try {
      // const event = req.body;
      const event = JSON.parse(req.body.toString());
      console.log('Shippo webhook:', event);

      if (
        event.event === 'transaction_created' &&
        event.data.status === 'SUCCESS'
      ) {
        const transactionId = event.data.object_id;
        console.log('transactionId', transactionId);
        const transaction = await shippo.transactions.get(transactionId);
        console.log('transaction', transaction);
        // Find order that has this transaction
        const order: any = await Order.findOne({
          'shipping.shippoTransactionId': transactionId,
        });
        if (order) {
          // return res.status(200).send('Order not found, ignoring.');
          console.log('Order found.');
          // Update order with label + tracking info
          order.shipping = {
            ...order.shipping,
            status: 'PURCHASED',
            trackingNumber: transaction.trackingNumber,
            labelUrl: transaction.labelUrl,
            trackingUrl: transaction.trackingUrlProvider,
          };

          await order.save();
          console.log(`Order ${order._id} updated with tracking info`);
        }

        const campaignOffer: any = await CampaignOffer.findOne({
          'shipping.shippoTransactionId': transactionId,
        });
        if (campaignOffer) {
          order.shipping = {
            ...order.shipping,
            status: 'PURCHASED',
            trackingNumber: transaction.trackingNumber,
            labelUrl: transaction.labelUrl,
            trackingUrl: transaction.trackingUrlProvider,
          };

          await order.save();
          console.log(`Campaign offer ${order._id} updated with tracking info`);
        }
      }

      res.status(200).send('ok');
    } catch (err) {
      console.error('Shippo webhook error:', err);
      res.status(500).send('Webhook handling failed');
    }
  },
);
router.post('/paypal-webhook', express.json(), handlePaypalWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: '*',
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

app.get(
  '/nice',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  async (req, res) => {
    const totalIncome = 100;
    const bussiness = await Bussiness.findById(req.user.profileId);
    res.send({ message: 'okey', totalIncome, bussiness });
  },
);

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

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
