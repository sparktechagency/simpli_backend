import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import CampaignService from './campaign.service';

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
const getAllCampaign = catchAsync(async (req, res) => {
  const result = await CampaignService.getAllCampaignFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Campaign retreived successfully`,
    data: result,
  });
});

const CampaignController = {
  createCampaign,
  getAllCampaign,
};
export default CampaignController;
