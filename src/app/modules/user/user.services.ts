/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config';
import AppError from '../../error/appError';
import registrationSuccessEmailBody from '../../mailTemplate/registerSucessEmail';
import sendEmail from '../../utilities/sendEmail';
import Bussiness from '../bussiness/bussiness.model';
import NormalUser from '../normalUser/normalUser.model';
import { NotificationSetting } from '../notificationSetting/notificationSetting.model';
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
    sendEmail({
      email: email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody('Dear', user[0].verifyCode),
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
    await User.findByIdAndUpdate(user[0]._id, { profileId: result[0]._id });
    // ! TODO: need to upgrade the email template
    sendEmail({
      email: payload.email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody('Dear', user[0].verifyCode),
    });
    await NotificationSetting.create({ user: result[0]._id });
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
  sendEmail({
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

      // Delete corresponding NormalUser documents
      const normalUserDeleteResult = await NormalUser.deleteMany({
        user: { $in: expiredUserIds },
      });

      // Delete the expired User documents
      const userDeleteResult = await User.deleteMany({
        _id: { $in: expiredUserIds },
      });

      console.log(
        `Deleted ${userDeleteResult.deletedCount} expired inactive users`,
      );
      console.log(
        `Deleted ${normalUserDeleteResult.deletedCount} associated NormalUser documents`,
      );
    }
  } catch (error) {
    console.log('Error deleting expired users and associated data:', error);
  }
});

const changeUserStatus = async (id: string, status: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );
  return result;
};

const userServices = {
  registerBussinessOwner,
  registerReviewer,
  verifyCode,
  resendVerifyCode,
  changeUserStatus,
};

export default userServices;
