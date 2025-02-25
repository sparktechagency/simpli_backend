import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ICampaignOffer } from './campaignOffer.interface';
import { CampaignOffer } from './campaignOffer.model';

const acceptCampaignOffer = async (
  profileId: string,
  payload: ICampaignOffer,
) => {
  const campaignOffer = await CampaignOffer.findOne({
    reviewer: profileId,
    campaign: payload.campaign,
  });
  if (campaignOffer) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already accept this offer');
  }

  const result = await CampaignOffer.create({
    ...payload,
    reviewer: profileId,
  });

  return result;
};

const CampaignOfferService = {
  acceptCampaignOffer,
};

export default CampaignOfferService;
