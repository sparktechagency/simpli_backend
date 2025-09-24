/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import axios, { AxiosError } from 'axios';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import AppError from '../../error/appError';
import {
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
} from '../../utilities/enum';
import paypalClient from '../../utilities/paypal';
import shippo from '../../utilities/shippo';
import stripe from '../../utilities/stripe';
import Campaign from '../campaign/campaign.model';
import { Store } from '../store/store.model';
import { USER_ROLE } from '../user/user.constant';
import { ICampaignOffer } from './campaignOffer.interface';
import { CampaignOffer } from './campaignOffer.model';

const acceptCampaignOffer = async (
  profileId: string,
  payload: ICampaignOffer,
) => {
  // Run queries in parallel
  const [campaignOffer, campaign] = await Promise.all([
    CampaignOffer.findOne({
      reviewer: profileId,
      campaign: payload.campaign,
    }),
    Campaign.findById(payload.campaign).select('amountForEachReview'),
  ]);

  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }

  if (campaignOffer) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already accepted this offer',
    );
  }

  return CampaignOffer.create({
    ...payload,
    reviewer: profileId,
    amount: campaign.amountForEachReview,
  });
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
  } else if (userData?.role == USER_ROLE.bussinessOwner) {
    filterQuery = {
      business: userData?.profileId,
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

const proceedDeliveryForCampaignOffer = async (
  businessId: string,
  payload: {
    campaignOfferId: string;
    selectedRateId: string;
    shipmentId: string;
    paymentMethod: string;
  },
) => {
  const { campaignOfferId, selectedRateId, shipmentId } = payload;
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
  const amount = parseFloat(selectedRate.amount);
  const shippingInfo = {
    rateId: selectedRate.objectId,
    provider: selectedRate.provider,
    service: selectedRate.servicelevel.name,
    amount: amount,
    currency: selectedRate.currency,
    shipmentId: shipment.objectId,
    status: 'PENDING', // not purchased yet
    shippoTransactionId: '',
  };

  campaignOffer.shipping = shippingInfo;
  campaignOffer.save();

  // Payment handling
  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
    const amountInCents = (amount * 100).toFixed();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Order Payment' },
            unit_amount: Number(amountInCents),
          },
          quantity: 1,
        },
      ],
      metadata: {
        campaignOfferId: campaignOffer._id.toString(),
        paymentPurpose: ENUM_PAYMENT_PURPOSE.PROCEED_CAMPAIGN_OFFER_DELIVERY,
      },
      success_url: config.stripe.stripe_order_payment_success_url,
      cancel_url: config.stripe.stripe_order_payment_cancel_url,
    });

    return { url: session.url };
  } else {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: `Payment for proceed campaign offer delivery: ${campaignOffer._id}`,
            custom_id: campaignOffer._id.toString(),
            reference_id: ENUM_PAYMENT_PURPOSE.PROCEED_CAMPAIGN_OFFER_DELIVERY,
          },
        ],
        application_context: {
          brand_name: 'Your Business Name',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: `${config.paypal.payment_capture_url}`,
          cancel_url: `${config.stripe.stripe_order_payment_cancel_url}`,
        },
      });

      const response = await paypalClient.execute(request);
      const approvalUrl = response.result.links.find(
        (link: any) => link.rel === 'approve',
      )?.href;

      if (!approvalUrl) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'PayPal payment creation failed',
        );
      }

      return { url: approvalUrl };
    } catch (error) {
      console.error('PayPal Payment Error:', error);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create PayPal order',
      );
    }
  }
};

const trackingOfferShipment = async (
  campaignOfferId: string,
  profileId: string,
) => {
  const campaignOffer = await CampaignOffer.findOne({
    $or: [{ reviewer: profileId }, { business: profileId }],
    _id: campaignOfferId,
  }).select('shipping');

  if (!campaignOffer) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign offer not found');
  }

  if (
    !campaignOffer.shipping?.provider ||
    !campaignOffer.shipping?.trackingNumber
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Shipping provider or tracking number missing',
    );
  }

  const carrier =
    process.env.NODE_ENV === 'development'
      ? 'shippo' // Shippo test mode
      : campaignOffer.shipping.provider.toLowerCase();

  const tracking_number =
    process.env.NODE_ENV === 'development'
      ? 'SHIPPO_TRANSIT'
      : campaignOffer.shipping.trackingNumber;

  try {
    const response = await axios.post(
      'https://api.goshippo.com/v1/tracks/',
      new URLSearchParams({
        carrier,
        tracking_number,
        metadata: `Order : ${campaignOffer._id}`,
      }),
      {
        headers: {
          Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    // console.log(response.data);

    const trackingData = response.data;

    return {
      trackingData,
    };
  } catch (error) {
    // 3️⃣ Axios error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status =
        axiosError.response?.status || httpStatus.INTERNAL_SERVER_ERROR;
      const data: any = axiosError.response?.data || {};
      throw new AppError(
        status,
        `Shippo API Error: ${axiosError.message}`,
        data,
      );
    }

    // 4️⃣ Other unexpected errors
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong while fetching tracking data',
    );
  }
};

const CampaignOfferService = {
  acceptCampaignOffer,
  getMyCampaignOfferFromDB,
  getSingleCampaignOffer,
  proceedDeliveryForCampaignOffer,
  trackingOfferShipment,
};

export default CampaignOfferService;
