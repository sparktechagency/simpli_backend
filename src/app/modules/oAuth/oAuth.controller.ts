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

const oAuthController = {
  loginWithGoogle,
};

export default oAuthController;
