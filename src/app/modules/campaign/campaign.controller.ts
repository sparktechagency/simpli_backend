import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import { CAMPAIGN_STATUS } from '../../utilities/enum';
import sendResponse from '../../utilities/sendResponse';
import CampaignService, { PerformanceFilter } from './campaign.service';

const createCampaign = catchAsync(async (req, res) => {
  const result = await CampaignService.createCampaign(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Campaign created successfully`,
    data: result,
  });
});
const updateCampaign = catchAsync(async (req, res) => {
  const result = await CampaignService.updateCampaignIntoDB(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Campaign updated successfully`,
    data: result,
  });
});
const getAllCampaign = catchAsync(async (req, res) => {
  const result = await CampaignService.getAllCampaignFromDB(
    req.query,
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Campaign retrieved successfully`,
    data: result,
  });
});
const getMyCampaigns = catchAsync(async (req, res) => {
  const result = await CampaignService.getMyCampaigns(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Campaign retrieved successfully`,
    data: result,
  });
});

// change campaign status -------------------------
const changeCampaignStatus = catchAsync(async (req, res) => {
  const result = await CampaignService.changeCampaignStatus(
    req.user.profileId,
    req.params.id,
    req.body.status,
  );
  let resMessage;
  if (result?.status === CAMPAIGN_STATUS.CANCELLED) {
    resMessage =
      'Campaign cancel successfully and you got refund the rest of amount from bugget';
  } else if (result?.status === CAMPAIGN_STATUS.PAUSED) {
    resMessage = 'Campaign paused successfully';
  } else if (result?.status === CAMPAIGN_STATUS.ACTIVE) {
    resMessage = 'Campaign activate successfully';
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: resMessage,
    data: result,
  });
});

const getSingleCampaign = catchAsync(async (req, res) => {
  const result = await CampaignService.getSingleCampaignFromDB(
    req.params.id,
    req.user,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Campaign retrived successfully`,
    data: result,
  });
});
const getCampaignSummary = catchAsync(async (req, res) => {
  const result = await CampaignService.getCampaignSummary(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Campaign summary retrieved successfully`,
    data: result,
  });
});
const getCampaignPerformance = catchAsync(async (req, res) => {
  const result = await CampaignService.getCampaignPerformance(
    req.params.id,
    req.query.filter as PerformanceFilter,
    req.query.tz as string | undefined,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Campaign performance retrieved successfully`,
    data: result,
  });
});

const getCampaignStats = catchAsync(async (req, res) => {
  const result = await CampaignService.getCampaignStats(req?.user?.profileId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Campaign stats retrieved successfully',
    data: result,
  });
});

const CampaignController = {
  createCampaign,
  getAllCampaign,
  changeCampaignStatus,
  getSingleCampaign,
  updateCampaign,
  getMyCampaigns,
  getCampaignSummary,
  getCampaignPerformance,
  getCampaignStats,
};
export default CampaignController;
