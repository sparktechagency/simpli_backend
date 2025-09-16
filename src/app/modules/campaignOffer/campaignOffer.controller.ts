import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import CampaignOfferService from './campaignOffer.service';

const acceptCampaignOffer = catchAsync(async (req, res) => {
  const result = await CampaignOfferService.acceptCampaignOffer(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Offer accepted successfully`,
    data: result,
  });
});
const getMyCampaignOffer = catchAsync(async (req, res) => {
  const result = await CampaignOfferService.getMyCampaignOfferFromDB(
    req.user.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Campaign offer retrieved successfully`,
    data: result,
  });
});
const getSingleCampaignOffer = catchAsync(async (req, res) => {
  const result = await CampaignOfferService.getSingleCampaignOffer(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Single campaign offer retrieved successfully`,
    data: result,
  });
});

const CampaignOfferController = {
  acceptCampaignOffer,
  getMyCampaignOffer,
  getSingleCampaignOffer,
};

export default CampaignOfferController;
