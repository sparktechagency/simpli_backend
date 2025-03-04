import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import MetaService from './meta.service';

const getReviewerMetaData = catchAsync(async (req, res) => {
  const result = await MetaService.getReviewerMetaData(
    req?.user?.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviewer meta data retrieved successfully',
    data: result,
  });
});

const MetaController = {
  getReviewerMetaData,
};

export default MetaController;
