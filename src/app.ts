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
      'http://45.55.251.203:3001',
      'http://45.55.251.203',
      'http://localhost:3000',
      'http://localhost:8000',
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

import {
  DescribeEndpointsCommand,
  MediaConvertClient,
} from '@aws-sdk/client-mediaconvert';

const client = new MediaConvertClient({ region: 'us-east-1' });

async function getEndpoint() {
  const command = new DescribeEndpointsCommand({});
  const response = await client.send(command);
  console.log(response.Endpoints);
}

getEndpoint();

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
