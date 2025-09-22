import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { userRoutes } from '../modules/user/user.routes';

import { bookmarkRoutes } from '../modules/bookmark/bookmark.routes';
import { bussinessRoutes } from '../modules/bussiness/bussiness.routes';
import { campaignRoutes } from '../modules/campaign/campaign.routes';
import { campaignOfferRoutes } from '../modules/campaignOffer/campaignOffer.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { commentRoutes } from '../modules/comment/comment.routes';
import { complianceInfoRoutes } from '../modules/complianceInfo/complianceInfo.routes';
import { followRoutes } from '../modules/follow/follow.routes';
import { metaRoutes } from '../modules/meta/meta.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { notificationSettingRoutes } from '../modules/notificationSetting/notificationSetting.routes';
import { oauthRoutes } from '../modules/oAuth/oAuth.routes';
import { orderRoutes } from '../modules/order/order.routes';
import { paymentRoutes } from '../modules/payment/payment.routes';
import { paypalRoutes } from '../modules/paypal/paypal.routes';
import { productRoutes } from '../modules/product/product.routes';
import { referralSalesRoutes } from '../modules/referralSales/referralSales.routes';
import { returnRoutes } from '../modules/return/return.routes';
import { reviewRoutes } from '../modules/review/review.routes';
import { reviewerRoutes } from '../modules/reviewer/reviewer.routes';
import { reviewReportRoutes } from '../modules/reviewReport/reviewReport.routes';
import { shippingAddressRoutes } from '../modules/shippingAddress/shippingAddress.routes';
import { shippoRoutes } from '../modules/shippo/shippo.routes';
import { storeRoutes } from '../modules/store/store.routes';
import { stripeRoutes } from '../modules/stripe/stripe.routes';
import { transactionRoutes } from '../modules/transaction/transaction.routes';
import { variantRoutes } from '../modules/variant/variant.routes';

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
    router: reviewerRoutes,
  },
  {
    path: '/shipping-address',
    router: shippingAddressRoutes,
  },
  {
    path: '/notification-setting',
    router: notificationSettingRoutes,
  },
  {
    path: '/cart',
    router: cartRoutes,
  },
  {
    path: '/campaign-offer',
    router: campaignOfferRoutes,
  },
  {
    path: '/campaign-offer',
    router: orderRoutes,
  },
  {
    path: '/bookmark',
    router: bookmarkRoutes,
  },
  {
    path: '/review',
    router: reviewRoutes,
  },
  {
    path: '/comment',
    router: commentRoutes,
  },
  {
    path: '/review-report',
    router: reviewReportRoutes,
  },
  {
    path: '/referral-sales',
    router: referralSalesRoutes,
  },
  {
    path: '/meta',
    router: metaRoutes,
  },
  {
    path: '/shippo',
    router: shippoRoutes,
  },
  {
    path: '/return',
    router: returnRoutes,
  },
  {
    path: '/follow',
    router: followRoutes,
  },
  {
    path: '/order',
    router: orderRoutes,
  },
  {
    path: '/oauth',
    router: oauthRoutes,
  },
  {
    path: '/payment',
    router: paymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
