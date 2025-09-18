/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import shippo from '../../utilities/shippo';
import { Store } from '../store/store.model';
import { USER_ROLE } from '../user/user.constant';
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

// get my campaign offer
const getMyCampaignOfferFromDB = async (
  userData: JwtPayload,
  query: Record<string, unknown>,
) => {
  let filterQuery = {};
  if (userData?.role === USER_ROLE.reviewer) {
    filterQuery = {
      reviewer: userData.profileId,
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

const getSingleCampaignOffer = async (userData: JwtPayload, id: string) => {
  let filterQuery = {};
  if (userData?.role === USER_ROLE.reviewer) {
    filterQuery = {
      reviewer: userData.profileId,
      _id: id,
    };
  } else if (userData?.role === USER_ROLE.bussinessOwner) {
    filterQuery = {
      business: userData?.profileId,
      _id: id,
    };
  }
  const result = await CampaignOffer.findOne(filterQuery)
    .populate({ path: 'campaign', select: 'name amountForEachReview endDate' })
    .populate({ path: 'product', select: 'name images' })
    .populate({ path: 'shippingAddress' });
  return result;
};

const proceedDeliveryForCampaignOffer = async (payload: {
  businessId: string;
  campaignOfferId: string;
  selectedRateId: string;
  shipmentId: string;
}) => {
  const { businessId, campaignOfferId, selectedRateId, shipmentId } = payload;
  const [businessStore, campaignOffer] = await Promise.all([
    Store.findOne({ bussiness: businessId }),
    CampaignOffer.findOne({ business: businessId, _id: campaignOfferId }),
  ]);

  if (!businessStore) {
    throw new AppError(httpStatus.NOT_FOUND, 'Business store not found');
  }
  if (!campaignOffer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign offer not found');
  }

  const shipment = await shippo.shipments.get(shipmentId);
  const selectedRate = shipment.rates.find(
    (r: any) => r.objectId == selectedRateId,
  );
  if (!selectedRate)
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid shipping rate');

  const shippingInfo = {
    rateId: selectedRate.objectId,
    provider: selectedRate.provider,
    service: selectedRate.servicelevel.name,
    amount: parseFloat(selectedRate.amount),
    currency: selectedRate.currency,
    shipmentId: shipment.objectId,
    status: 'PENDING', // not purchased yet
    shippoTransactionId: '',
  };

  campaignOffer.shipping = shippingInfo;
  campaignOffer.save();
};

const CampaignOfferService = {
  acceptCampaignOffer,
  getMyCampaignOfferFromDB,
  getSingleCampaignOffer,
  proceedDeliveryForCampaignOffer,
};

export default CampaignOfferService;
