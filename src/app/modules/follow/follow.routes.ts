import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import FollowController from './follow.controller';

const router = express.Router();

router.post(
  '/follow-unfollow/:userId',
  auth(USER_ROLE.reviewer),
  FollowController.followUnfollowUser,
);
router.get(
  '/followers',
  auth(USER_ROLE.reviewer),
  FollowController.getFollowers,
);
router.get(
  '/following',
  auth(USER_ROLE.reviewer),
  FollowController.getFollowing,
);

export const followRoutes = router;
