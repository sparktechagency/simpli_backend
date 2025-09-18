/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import auth from '../../middlewares/auth';
import '../middleware/passport';
import { USER_ROLE } from '../user/user.constant';
import oAuthController from './oAuth.controller';

const router = express.Router();

router.post('/login', oAuthController.oAuthLogin);
router.post(
  '/link-social',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  oAuthController.oAuthLink,
);
export default router;
