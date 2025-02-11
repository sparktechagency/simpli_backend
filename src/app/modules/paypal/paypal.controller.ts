import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import PaypalService from './paypal.service';

const createOnboardingLinkForPaypalPartner = catchAsync(async (req, res) => {
  const result = await PaypalService.createOnboardingLinkForPartnerAccount(
    req.user.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Link created successfully',
    data: result,
  });
});

const savePaypalAccount = catchAsync(async (req, res) => {
  const result = await PaypalService.savePaypalAccount(
    req.query.merchantId as string,
    req.query.userId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Account connected succesfully for payment',
    data: result,
  });
});

const PaypalController = {
  createOnboardingLinkForPaypalPartner,
  savePaypalAccount,
};

export default PaypalController;
