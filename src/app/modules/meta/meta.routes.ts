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

export const metaRoutes = router;
