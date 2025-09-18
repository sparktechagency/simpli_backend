import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { INTEREST_STATUS } from '../../utilities/enum';
import Bussiness from '../bussiness/bussiness.model';
import { IReviewer } from './reviewer.interface';
import Reviewer from './reviewer.model';

const getReviewerProfile = async (profileId: string) => {
  const result = await Reviewer.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(profileId),
      },
    },

    {
      $lookup: {
        from: 'categories',
        localField: 'interestedCategory',
        foreignField: '_id',
        as: 'interestedCategory',
      },
    },

    {
      $lookup: {
        from: 'follows',
        localField: '_id',
        foreignField: 'following',
        as: 'followersData',
      },
    },

    {
      $lookup: {
        from: 'follows',
        localField: '_id',
        foreignField: 'follower',
        as: 'followingData',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'reviewer',
        as: 'reviewsData',
      },
    },

    {
      $project: {
        _id: 1,
        user: 1,
        name: 1,
        username: 1,
        email: 1,
        city: 1,
        zipcode: 1,
        gender: 1,
        age: 1,
        ethnicity: 1,
        educationLevel: 1,
        maritalStatus: 1,
        employmentStatus: 1,
        householdIncome: 1,
        familyAndDependents: 1,
        interestedCategory: 1,
        currentlyShareReview: 1,
        interestedCategoryStatus: 1,
        currentShareReviewStatus: 1,
        shippingInformationStatus: 1,
        socailInfoStatus: 1,
        profileDetailStatus: 1,
        receiveProductBy: 1,
        minPriceForReview: 1,
        maxPriceForReview: 1,
        isPersonalInfoProvided: 1,
        isAddressProvided: 1,
        profile_image: 1,
        bio: 1,
        instagram: 1,
        youtube: 1,
        twitter: 1,
        tiktok: 1,
        whatsapp: 1,
        facebook: 1,
        blog: 1,
        totalEarning: 1,
        currentBalance: 1,
        createdAt: 1,
        updatedAt: 1,
        totalFollowers: { $size: '$followersData' },
        totalFollowing: { $size: '$followingData' },
        totalReviews: { $size: '$reviewsData' },
        isStripeAccountConnected: 1,
        stripeConnectedAccountId: 1,
      },
    },
  ]);

  return result[0];
};

const addAddress = async (reviewerId: string, payload: Partial<IReviewer>) => {
  payload.isAddressProvided = true;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const addPersonalInfo = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.isPersonalInfoProvided = true;

  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const addInterestedCategory = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.interestedCategoryStatus = INTEREST_STATUS.COMPLETED;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};
const addCurrentlyShareReview = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.interestedCategoryStatus = INTEREST_STATUS.COMPLETED;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const addSocailInfo = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  payload.socailInfoStatus = INTEREST_STATUS.COMPLETED;
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// update reviewer

const updateReviewerIntoDB = async (
  reviewerId: string,
  payload: Partial<IReviewer>,
) => {
  if (payload.username) {
    const isExist = await Reviewer.findById({ username: payload.username });
    if (isExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'This username not available');
    }
  }
  const result = await Reviewer.findByIdAndUpdate(reviewerId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const makeSkip = async (reviewerId: string, skipValue: string) => {
  const result = await Reviewer.findByIdAndUpdate(
    reviewerId,
    {
      $set: { [skipValue]: INTEREST_STATUS.SKIPPED },
    },
    { new: true, runValidators: true },
  );

  return result;
};

const followUnfollowReviewer = async (
  followerId: string,
  followingId: string,
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(followerId) ||
      !mongoose.Types.ObjectId.isValid(followingId)
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid user IDs');
    }

    if (followerId === followingId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You cannot follow yourself');
    }

    const followerObjectId = new mongoose.Types.ObjectId(followerId);
    const followingObjectId = new mongoose.Types.ObjectId(followingId);

    const followingUser =
      await Reviewer.findById(followingId).select('followers');
    if (!followingUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'Reviewer not found');
    }

    const alreadyFollowing = followingUser.followers.includes(followerObjectId);

    await Reviewer.findByIdAndUpdate(
      followerId,
      alreadyFollowing
        ? { $pull: { following: followingObjectId } }
        : { $addToSet: { following: followingObjectId } },
      { new: true },
    );

    await Reviewer.findByIdAndUpdate(
      followingId,
      alreadyFollowing
        ? { $pull: { followers: followerObjectId } }
        : { $addToSet: { followers: followerObjectId } },
      { new: true },
    );

    const totalFollowers =
      await Reviewer.findById(followingId).select('followers');
    const totalFollowersCount = totalFollowers?.followers.length;

    return {
      followingId,
      following: !alreadyFollowing,
      totalFollowers: totalFollowersCount,
    };
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while following/unfollowing user',
    );
  }
};

const followUnfollowBussiness = async (
  profileId: string,
  bussinessId: string,
) => {
  const bussiness = await Bussiness.findById(bussinessId);
  if (!bussiness) {
    throw new AppError(httpStatus.NOT_FOUND, 'Store not found');
  }
  const followerObjectId = new mongoose.Types.ObjectId(profileId);
  const alreadyFollowing = bussiness.followers.includes(followerObjectId);
  await Reviewer.findByIdAndUpdate(
    profileId,
    alreadyFollowing
      ? { $pull: { following: bussinessId } }
      : { $addToSet: { following: bussinessId } },
    { new: true },
  );

  await Bussiness.findByIdAndUpdate(
    bussinessId,
    alreadyFollowing
      ? { $pull: { followers: followerObjectId } }
      : { $addToSet: { followers: followerObjectId } },
    { new: true },
  );

  return {
    following: !alreadyFollowing,
  };
};

const ReviewerService = {
  addAddress,
  addPersonalInfo,
  addInterestedCategory,
  addCurrentlyShareReview,
  addSocailInfo,
  updateReviewerIntoDB,
  makeSkip,
  getReviewerProfile,
  followUnfollowReviewer,
  followUnfollowBussiness,
};

export default ReviewerService;
