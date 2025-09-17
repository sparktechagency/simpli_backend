import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import FollowServices from './follow.service';

const followUnfollowUser = catchAsync(async (req, res) => {
  const followerId = req.user.profileId;
  const followingId = req.params.id;

  const result = await FollowServices.followUnfollowUser(
    followerId,
    followingId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Successfully ${result.action}`,
    data: null,
  });
});

const getFollowers = catchAsync(async (req, res) => {
  const result = await FollowServices.getFollowers(req.user.profileId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Followers retrieved successfully',
    data: result,
  });
});

const getFollowing = catchAsync(async (req, res) => {
  const result = await FollowServices.getFollowing(req.user.profileId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following retrieved successfully',
    data: result,
  });
});

const FollowController = {
  followUnfollowUser,
  getFollowers,
  getFollowing,
};

export default FollowController;
