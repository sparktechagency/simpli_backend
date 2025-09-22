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
const getBussinessMetaData = catchAsync(async (req, res) => {
  const result = await MetaService.getBussinessMetaData(
    req?.user?.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bussiness meta data retrieved successfully',
    data: result,
  });
});
const reviewerEarningMetaData = catchAsync(async (req, res) => {
  const result = await MetaService.reviewerEarningMetaData(
    req?.user?.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviewer earning meta data retrieved successfully',
    data: result,
  });
});
const getCampaignMetaData = catchAsync(async (req, res) => {
  const result = await MetaService.getCampaignMetaData(
    req?.user?.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Campaign meta data retrieved successfully',
    data: result,
  });
});

const MetaController = {
  getReviewerMetaData,
  getBussinessMetaData,
  reviewerEarningMetaData,
  getCampaignMetaData,
};

export default MetaController;
