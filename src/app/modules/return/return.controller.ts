import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReturnService from './return.service';

const createReturn = catchAsync(async (req, res) => {
  const result = await ReturnService.createReturn(
    req?.user?.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Return created successfully',
    data: result,
  });
});
const getAllReturn = catchAsync(async (req, res) => {
  const result = await ReturnService.getAllReturn(
    req?.user?.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Return retrieved successfully',
    data: result,
  });
});

const ReturnController = {
  createReturn,
  getAllReturn,
};

export default ReturnController;
