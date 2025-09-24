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
const getMyOrders = catchAsync(async (req, res) => {
  const result = await OrderService.getMyOrders(
    req?.user?.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});
const getSingleOrder = catchAsync(async (req, res) => {
  const result = await OrderService.getSingleOrder(
    req?.user?.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});
const trackingOrder = catchAsync(async (req, res) => {
  const result = await OrderService.trackingOrder(
    req.params.id,
    req.user?.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tracked data retrieved successfully',
    data: result,
  });
});

const OrderController = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  trackingOrder,
};

export default OrderController;
