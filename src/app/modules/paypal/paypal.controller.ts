import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import PaypalService from './paypal.service';
import config from '../../config';

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
  if (!result) {
    return res.redirect(`${config.paypal.paypal_onboarding_success}`);
  }

  return res.redirect(`${config.paypal.paypal_onboarding_failed}`);
});

const PaypalController = {
  createOnboardingLinkForPaypalPartner,
  savePaypalAccount,
};

export default PaypalController;
