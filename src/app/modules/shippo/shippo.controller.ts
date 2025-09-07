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

const ShippoController = {
  getShippingMethods,
};

export default ShippoController;
