/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config';
import AppError from '../../error/appError';
import registrationSuccessEmailBody from '../../mailTemplate/registerSucessEmail';
import sendResendEmail from '../../utilities/sendResendEmail';
import Bussiness from '../bussiness/bussiness.model';
import { NotificationSetting } from '../notificationSetting/notificationSetting.model';
import Product from '../product/product.model';
import Reviewer from '../reviewer/reviewer.model';
import { USER_ROLE } from './user.constant';
import { TUser, TUserRole } from './user.interface';
import { User } from './user.model';
import { createToken } from './user.utils';
const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};

const registerBussinessOwner = async (email: string, password: string) => {
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exist');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userDataPayload: Partial<TUser> = {
      email: email,
      password: password,
      role: USER_ROLE.bussinessOwner,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 2 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userDataPayload], { session });

    const bussinessOwnerPayload = {
      email,
      user: user[0]._id,
    };
    const result = await Bussiness.create([bussinessOwnerPayload], { session });
    await User.findByIdAndUpdate(
      user[0]._id,
      { profileId: result[0]._id },
      { session },
    );
    await NotificationSetting.create([{ user: result[0]._id }], { session });

    await sendResendEmail({
      email: email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(`Hi`, user[0].verifyCode),
    });

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// register reviewer

const registerReviewer = async (payload: any) => {
  const emailExist = await User.findOne({ email: payload.email });
  if (emailExist) {
    throw new AppError(httpStatus.CONFLICT, 'This email already exist');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userDataPayload: Partial<TUser> = {
      email: payload.email,
      password: payload.password,
      role: USER_ROLE.reviewer,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 2 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userDataPayload], { session });
    const reviewerPayload = {
      email: payload.email,
      name: payload.name,
      username: payload.username,
      user: user[0]._id,
    };
    const result = await Reviewer.create([reviewerPayload], { session });
    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to registered');
    }

    await User.findByIdAndUpdate(
      user[0]._id,
      { profileId: result[0]._id },
      { session },
    );
    sendResendEmail({
      email: payload.email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(
        `Hi${payload.name}`,
        user[0].verifyCode,
      ),
    });
    await NotificationSetting.create([{ user: result[0]._id }], { session });
    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const verifyCode = async (email: string, verifyCode: number) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
  }
  if (verifyCode !== user.verifyCode) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
  }
  await User.findOneAndUpdate(
    { email: email },
    { isVerified: true },
    { new: true, runValidators: true },
  );

  const jwtPayload = {
    id: user?._id,
    profileId: user.profileId,
    email: user?.email,
    role: user?.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const resendVerifyCode = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const verifyCode = generateVerifyCode();
  const updateUser = await User.findOneAndUpdate(
    { email: email },
    { verifyCode: verifyCode, codeExpireIn: new Date(Date.now() + 5 * 60000) },
    { new: true, runValidators: true },
  );
  if (!updateUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong . Please again resend the code after a few second',
    );
  }
  sendResendEmail({
    email: user.email,
    subject: 'Activate Your Account',
    html: registrationSuccessEmailBody('Dear', updateUser.verifyCode),
  });
  return null;
};

// all cron jobs for users

cron.schedule('*/2 * * * *', async () => {
  try {
    const now = new Date();

    // Find unverified users whose expiration time has passed
    const expiredUsers = await User.find({
      isVerified: false,
      codeExpireIn: { $lte: now },
    });

    if (expiredUsers.length > 0) {
      const expiredUserIds = expiredUsers.map((user) => user._id);

      // Delete corresponding Reviewer documents
      const reviewerDeleteResult = await Reviewer.deleteMany({
        user: { $in: expiredUserIds },
      });

      // Delete corresponding Bussiness documents
      const bussinessDeleteResult = await Bussiness.deleteMany({
        user: { $in: expiredUserIds },
      });

      // Delete expired User documents
      const userDeleteResult = await User.deleteMany({
        _id: { $in: expiredUserIds },
      });

      console.log(
        `Deleted ${userDeleteResult.deletedCount} expired inactive users`,
      );

      console.log(
        `Deleted ${reviewerDeleteResult.deletedCount} associated Reviewer documents`,
      );

      console.log(
        `Deleted ${bussinessDeleteResult.deletedCount} associated Bussiness documents`,
      );
    }
  } catch (error) {
    console.log('Error deleting expired users and associated data:', error);
  }
});

const changeUserStatus = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { isBlocked: !user.isBlocked },
    { new: true, runValidators: true },
  );
  return result;
};

const deleteAccount = async (
  userData: JwtPayload,
  payload: { reasonForLeaving: string; password: string },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userData.id).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const isMatch = await User.isPasswordMatched(
      payload?.password,
      user?.password,
    );
    if (!isMatch) {
      throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
    }

    let result;
    if (userData.role === USER_ROLE.reviewer) {
      // Soft delete user
      await User.findByIdAndUpdate(
        userData.id,
        { isDeleted: true },
        { session },
      );
      result = await Reviewer.findByIdAndUpdate(
        userData.profileId,
        {
          reasonForLeaving: payload.reasonForLeaving,
          isDeleted: true,
        },
        { session, new: true },
      );
    } else {
      // Soft delete user
      await User.findByIdAndUpdate(
        userData.id,
        { isDeleted: true },
        { session },
      );
      result = await Bussiness.findByIdAndUpdate(
        userData.profileId,
        {
          reasonForLeaving: payload.reasonForLeaving,
          isDeleted: true,
        },
        { session, new: true },
      );

      await Product.updateMany(
        { bussiness: userData.profileId },
        { isDeleted: true },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const userServices = {
  registerBussinessOwner,
  registerReviewer,
  verifyCode,
  resendVerifyCode,
  changeUserStatus,
  deleteAccount,
};

export default userServices;
