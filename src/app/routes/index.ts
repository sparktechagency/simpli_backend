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
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
