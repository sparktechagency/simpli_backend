import { JwtPayload } from 'jsonwebtoken';
import { TUserRole } from '../user/user.interface';
import { createToken } from '../user/user.utils';
import config from '../../config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import appleSigninAuth from 'apple-signin-auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import dotenv from 'dotenv';
import { User } from '../user/user.model';
import Bussiness from '../bussiness/bussiness.model';
import Reviewer from '../reviewer/reviewer.model';
import { USER_ROLE } from '../user/user.constant';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

dotenv.config();
const loginWithGoogle = async (user: JwtPayload) => {
  const jwtPayload = {
    id: user?._id,
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

const loginWithOAuth = async (
  provider: string,
  token: string,
  role: TUserRole,
) => {
  let email, id, name, picture;

  if (provider === 'google') {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');

    email = payload.email!;
    id = payload.sub;
    name = payload.name!;
    picture = payload.picture!;
  } else if (provider === 'facebook') {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,email,name,picture&access_token=${token}`,
    );
    email = response.data.email;
    id = response.data.id;
    name = response.data.name;
    picture = response.data.picture.data.url;
  } else if (provider === 'apple') {
    const appleUser = await appleSigninAuth.verifyIdToken(token, {
      audience: process.env.APPLE_CLIENT_ID!,
      ignoreExpiration: false,
    });
    email = appleUser.email;
    id = appleUser.sub;
    name = 'Apple User';
  } else {
    throw new Error('Invalid provider');
  }

  let user = await User.findOne({ [`${provider}Id`]: id });

  if (!user) {
    user = new User({
      email,
      [`${provider}Id`]: id,
      name,
      profilePic: picture,
      role,
    });
    await user.save();

    if (role === USER_ROLE.bussinessOwner)
      await Bussiness.create({
        user: user._id,
        email: email,
        profile_image: picture,
      });
    else
      await Reviewer.create({
        user: user._id,
        email: email,
        profile_image: picture,
      });
  }

  const jwtPayload = {
    id: user?._id,
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

  return { accessToken, refreshToken };
};

const linkSocialAccount = async (
  provider: string,
  token: string,
  userId: string,
) => {
  let id;

  if (provider === 'google') {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');

    id = payload.sub;
  } else if (provider === 'facebook') {
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,email&access_token=${token}`,
    );

    id = response.data.id;
  } else if (provider === 'apple') {
    const appleUser = await appleSigninAuth.verifyIdToken(token, {
      audience: process.env.APPLE_CLIENT_ID!,
      ignoreExpiration: false,
    });

    id = appleUser.sub;
  } else {
    throw new Error('Invalid provider');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const existingUser = await User.findOne({ [`${provider}Id`]: id });
  if (existingUser && existingUser._id.toString() !== userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "'This social account is already linked to another user.'",
    );
  }

  user[`${provider}Id`] = id;
  await user.save();
  return user;
};

const oAuthService = {
  loginWithOAuth,
  loginWithGoogle,
  linkSocialAccount,
};

export default oAuthService;
