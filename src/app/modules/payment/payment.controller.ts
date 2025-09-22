import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import PaymentService from './payment.service';

const makeWithDraw = catchAsync(async (req, res) => {
  const result = await PaymentService.makeWithDraw(req?.user, req.body.amount);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Withdrawal successful',
    data: result,
  });
});

const PaymentController = {
  makeWithDraw,
};

export default PaymentController;
