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
import handlePaypalWebhook from './app/handlePaypal/handlePaypalWebhook';
import capturePayPalPayment from './app/handlePaypal/capturePaypalPayment';
import onboardingRefresh from './app/handleStripe/onboardingRefresh';
import auth from './app/middlewares/auth';
import { USER_ROLE } from './app/modules/user/user.constant';
import Bussiness from './app/modules/bussiness/bussiness.model';
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

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
