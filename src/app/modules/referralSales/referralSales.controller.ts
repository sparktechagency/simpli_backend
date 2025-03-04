import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReferralSalesService from './referralSales.service';

const getReferralSales = catchAsync(async (req, res) => {
  const result = await ReferralSalesService.getReferralSales(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Referral Sales retrieved successfully',
    data: result,
  });
});

const ReferralSalesController = {
  getReferralSales,
};

export default ReferralSalesController;
