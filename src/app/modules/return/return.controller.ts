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

const ReturnController = {
  createReturn,
};

export default ReturnController;
