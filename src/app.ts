/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import capturePayPalPayment from './app/handlePaypal/capturePaypalPayment';
import handlePaypalWebhook from './app/handlePaypal/handlePaypalWebhook';
import onboardingRefresh from './app/handleStripe/onboardingRefresh';
import handleWebhook from './app/handleStripe/webhook';
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import auth from './app/middlewares/auth';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import Bussiness from './app/modules/bussiness/bussiness.model';
import { USER_ROLE } from './app/modules/user/user.constant';
import router from './app/routes';
const app: Application = express();
// parser
app.post(
  '/sampli-webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook,
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

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
