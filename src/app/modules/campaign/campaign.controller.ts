import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import CampaignService from './campaign.service';
import { CAMPAIGN_STATUS } from '../../utilities/enum';

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
  const result = await CampaignService.getAllCampaignFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Campaign retreived successfully`,
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

const CampaignController = {
  createCampaign,
  getAllCampaign,
  changeCampaignStatus,
  getSingleCampaign,
  updateCampaign,
};
export default CampaignController;
