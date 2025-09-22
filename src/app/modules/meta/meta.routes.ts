import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import MetaController from './meta.controller';

const router = express.Router();

router.get(
  '/get-reviewer-meta-data',
  auth(USER_ROLE.reviewer),
  MetaController.getReviewerMetaData,
);

router.get(
  '/get-bussiness-meta-data',
  auth(USER_ROLE.bussinessOwner),
  MetaController.getBussinessMetaData,
);
router.get(
  '/get-bussiness-meta-data',
  auth(USER_ROLE.bussinessOwner),
  MetaController.getBussinessMetaData,
);
router.get(
  '/get-reviewer-earning-meta-data',
  auth(USER_ROLE.reviewer),
  MetaController.reviewerEarningMetaData,
);

export const metaRoutes = router;
