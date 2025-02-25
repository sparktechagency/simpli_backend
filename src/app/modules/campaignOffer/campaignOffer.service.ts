import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ICampaignOffer } from './campaignOffer.interface';
import { CampaignOffer } from './campaignOffer.model';
import QueryBuilder from '../../builder/QueryBuilder';

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

// get my campaign offer
const getMyCampaignOfferFromDB = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const campaignOfferQuery = new QueryBuilder(CampaignOffer.find(), query)
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await campaignOfferQuery.modelQuery;
  const meta = await campaignOfferQuery.countTotal();

  return {
    meta,
    result,
  };
};

const CampaignOfferService = {
  acceptCampaignOffer,
  getMyCampaignOfferFromDB,
};

export default CampaignOfferService;
