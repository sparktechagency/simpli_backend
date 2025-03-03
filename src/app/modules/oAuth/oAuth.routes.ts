/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import passport from 'passport';
import '../middleware/passport';
import oAuthController from './oAuth.controller';

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

export default router;
