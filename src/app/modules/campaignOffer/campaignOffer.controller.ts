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

const CampaignOfferController = {
  acceptCampaignOffer,
};

export default CampaignOfferController;
