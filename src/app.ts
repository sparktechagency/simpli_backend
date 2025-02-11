/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
const app: Application = express();
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import handleWebhook from './app/handleStripe/webhook';
import handlePaypalWebhook from './app/handlePaypalEvents/handlePaypalWebhook';
import capturePayPalPayment from './app/handlePaypalEvents/capturePaypalPayment';
import stripe from './app/utilities/stripe';
import config from './app/config';
// parser
app.post(
  '/simpli-webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook,
);
router.post('/paypal-webhook', express.json(), handlePaypalWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://localhost:3008',
    ],
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

// onboarding refresh --------------
router.get('/stripe/onboarding/refresh', async (req, res, next) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).send('Missing accountId');
    }
    const accountLink = await stripe.accountLinks.create({
      account: accountId as string,
      refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${accountId}`,
      return_url: config.stripe.onboarding_return_url,
      type: 'account_onboarding',
    });

    res.redirect(accountLink.url);
  } catch (error) {
    next(error);
  }
});

app.get('/capture-payment', capturePayPalPayment);

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
