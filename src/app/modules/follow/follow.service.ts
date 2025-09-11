import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Follow from './follow.model';

const followUnfollowUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You can't follow yourself");
  }

  const existing = await Follow.findOne({
    follower: followerId,
    following: followingId,
  });

  if (existing) {
    // Unfollow
    await Follow.findByIdAndDelete(existing._id);
    return { action: 'unfollowed' };
  } else {
    // Follow
    await Follow.create({
      follower: followerId,
      following: followingId,
    });
    return { action: 'followed' };
  }
};

const getFollowers = async (userId: string) => {
  return Follow.find({ following: userId })
    .select('follower -_id')
    .populate('follower', 'name email');
};

const getFollowing = async (userId: string) => {
  return Follow.find({ follower: userId })
    .select('following -_id')
    .populate('following', 'name email');
};

const FollowServices = {
  followUnfollowUser,
  getFollowers,
  getFollowing,
};

export default FollowServices;
