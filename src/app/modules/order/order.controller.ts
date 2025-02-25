import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import OrderService from './order.service';

const createOrder = catchAsync(async (req, res) => {
  const result = await OrderService.createOrder(req?.user?.profileId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const OrderController = {
  createOrder,
};

export default OrderController;
