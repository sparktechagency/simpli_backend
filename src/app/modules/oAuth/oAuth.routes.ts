/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import passport from 'passport';
import '../middleware/passport';
import oAuthController from './oAuth.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  oAuthController.loginWithGoogle,
);
router.post('/oauth-login', oAuthController.oAuthLogin);
router.post(
  '/link-social',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  oAuthController.oAuthLink,
);
export default router;
