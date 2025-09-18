import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ShippingAddressService from './shippingAddress.service';

const createShippingAddress = catchAsync(async (req, res) => {
  console.log('user', req.user);
  const result = await ShippingAddressService.createShippingAddress(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Shipping address added successfully',
    data: result,
  });
});
const updateShippingAddress = catchAsync(async (req, res) => {
  const result = await ShippingAddressService.updateShippingAddress(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shipping address updated successfully',
    data: result,
  });
});

const getShippingAddress = catchAsync(async (req, res) => {
  const result = await ShippingAddressService.getShippingAddress(
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shipping address retrieved successfully',
    data: result,
  });
});
const deleteShippingAddress = catchAsync(async (req, res) => {
  const result = await ShippingAddressService.deleteShippingAddress(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shipping address deleted successfully',
    data: result,
  });
});

const ShippingAddressController = {
  createShippingAddress,
  updateShippingAddress,
  getShippingAddress,
  deleteShippingAddress,
};

export default ShippingAddressController;
