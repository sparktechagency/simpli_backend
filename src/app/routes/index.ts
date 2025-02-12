import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';

import { notificationRoutes } from '../modules/notification/notification.routes';
import { complianceInfoRoutes } from '../modules/complianceInfo/complianceInfo.routes';
import { bussinessRoutes } from '../modules/bussiness/bussiness.routes';
import { productRoutes } from '../modules/product/product.routes';
import { variantRoutes } from '../modules/variant/variant.routes';
import { storeRoutes } from '../modules/store/store.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { campaignRoutes } from '../modules/campaign/campaign.routes';
import { transactionRoutes } from '../modules/transaction/transaction.routes';
import { stripeRoutes } from '../modules/stripe/stripe.routes';
import { paypalRoutes } from '../modules/paypal/paypal.routes';
import { reviewRoutes } from '../modules/reviewer/reviewer.routes';
import { shippingAddressRoutes } from '../modules/shippingAddress/shippingAddress.routes';
import { notificationSettingRoutes } from '../modules/notificationSetting/notificationSetting.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/user',
    router: userRoutes,
  },
  {
    path: '/normal-user',
    router: normalUserRoutes,
  },

  {
    path: '/manage',
    router: ManageRoutes,
  },
  {
    path: '/notification',
    router: notificationRoutes,
  },
  {
    path: '/compliance-info',
    router: complianceInfoRoutes,
  },
  {
    path: '/bussiness',
    router: bussinessRoutes,
  },
  {
    path: '/product',
    router: productRoutes,
  },
  {
    path: '/variant',
    router: variantRoutes,
  },
  {
    path: '/store',
    router: storeRoutes,
  },
  {
    path: '/category',
    router: categoryRoutes,
  },
  {
    path: '/campaign',
    router: campaignRoutes,
  },
  {
    path: '/transaction',
    router: transactionRoutes,
  },
  {
    path: '/stripe',
    router: stripeRoutes,
  },
  {
    path: '/paypal',
    router: paypalRoutes,
  },
  {
    path: '/reviewer',
    router: reviewRoutes,
  },
  {
    path: '/shippingAddress',
    router: shippingAddressRoutes,
  },
  {
    path: '/notificationSetting',
    router: notificationSettingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
