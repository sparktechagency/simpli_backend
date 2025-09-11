import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ShippoService from './shippo.service';

const getShippingMethods = catchAsync(async (req, res) => {
  const result = await ShippoService.getShippingOptions(
    req.body.bussinessId,
    req.body.shippingAddressId,
    req.body.parcel,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shipping method retrieved successfully',
    data: result,
  });
});
const getShippingRatesForCheckout = catchAsync(async (req, res) => {
  const result = await ShippoService.getShippingRatesForCheckout(
    req.user.profileId,
    req.body.shippingAddressId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shipping rates retrieved successfully',
    data: result,
  });
});

const ShippoController = {
  getShippingMethods,
  getShippingRatesForCheckout,
};

export default ShippoController;
