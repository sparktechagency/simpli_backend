import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import userServices from './user.services';

const registerUser = catchAsync(async (req, res) => {
  const result = await userServices.registerBussinessOwner(
    req.body.email,
    req.body.password,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Registration successful.Check email for verify your email',
    data: result,
  });
});
const registerReviewer = catchAsync(async (req, res) => {
  const result = await userServices.registerReviewer(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Registration successful.Check email for verify your email',
    data: result,
  });
});
const verifyCode = catchAsync(async (req, res) => {
  const result = await userServices.verifyCode(
    req?.body?.email,
    req?.body?.verifyCode,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully verified your account with email',
    data: result,
  });
});
const resendVerifyCode = catchAsync(async (req, res) => {
  const result = await userServices.resendVerifyCode(req?.body?.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Verify code send to your email inbox',
    data: result,
  });
});

const changeUserStatus = catchAsync(async (req, res) => {
  const result = await userServices.changeUserStatus(
    req.params.id,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User is ${result?.status}`,
    data: result,
  });
});

const userController = {
  registerUser,
  registerReviewer,
  verifyCode,
  resendVerifyCode,
  changeUserStatus,
};
export default userController;
