/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import catchAsync from '../../utilities/catchasync';
import oAuthService from './oAuth.service';
import sendResponse from '../../utilities/sendResponse';

const loginWithGoogle = catchAsync(async (req, res) => {
  const user = req.user as any;

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized user');
  }
  const result = await oAuthService.loginWithGoogle(user);
  res.cookie('refresh-token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login successfully',
    data: result,
  });
});

const oAuthLogin = catchAsync(async (req, res) => {
  const { provider, token, role } = req.body;
  if (!['google', 'apple', 'facebook'].includes(provider)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid provider');
  }
  const result = await oAuthService.loginWithOAuth(provider, token, role);
  res.cookie('refresh-token', result.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login successfully',
    data: result,
  });
});
const oAuthLink = catchAsync(async (req, res) => {
  const { provider, token } = req.body;
  if (!['google', 'apple', 'facebook'].includes(provider)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid provider');
  }
  const result = await oAuthService.loginWithOAuth(
    provider,
    token,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Social link successfully',
    data: result,
  });
});

const oAuthController = {
  loginWithGoogle,
  oAuthLogin,
  oAuthLink,
};

export default oAuthController;
