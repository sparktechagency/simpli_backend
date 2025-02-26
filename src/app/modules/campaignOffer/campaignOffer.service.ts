import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ICampaignOffer } from './campaignOffer.interface';
import { CampaignOffer } from './campaignOffer.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';

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
  userData: JwtPayload,
  query: Record<string, unknown>,
) => {
  let filterQuery = {};
  if (userData?.role === USER_ROLE.reviewer) {
    filterQuery = {
      reveviewer: userData.profileId,
    };
  } else if (userData?.role === USER_ROLE.bussinessOwner) {
    filterQuery = {
      bussiness: userData?.profileId,
    };
  }

  const campaignOfferQuery = new QueryBuilder(
    CampaignOffer.find(filterQuery)
      .populate({
        path: 'campaign',
        select: 'name amountForEachReview endDate',
      })
      .populate({ path: 'product', select: 'name images' }),
    query,
  )
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
