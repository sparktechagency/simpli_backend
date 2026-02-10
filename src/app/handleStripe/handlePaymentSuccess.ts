/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import httpStatus from 'http-status';
import AppError from '../error/appError';
import Campaign from '../modules/campaign/campaign.model';
import {
  ENUM_TRANSACTION_REASON,
  ENUM_TRANSACTION_TYPE,
} from '../modules/transaction/transaction.enum';
import { Transaction } from '../modules/transaction/transaction.model';
import {
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
  ENUM_PAYMENT_STATUS,
} from '../utilities/enum';
import campaignOfferDeliveryPaymentSuccess from './campaignOfferDeliveryPaymentSuccess';
import handleOrderPaymentSuccess from './handleOrderPaymentSuccess';

const handlePaymentSuccess = async (
  metaData: any,
  transactionId: string,
  amount: number,
) => {
  if (metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN) {
    await handleCampaignRunPaymentSuccess(
      metaData.campaignId,
      transactionId,
      amount,
    );
  } else if (metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.ORDER) {
    await handleOrderPaymentSuccess(metaData.orderId, transactionId, amount);
  } else if (
    metaData.paymentPurpose ==
    ENUM_PAYMENT_PURPOSE.PROCEED_CAMPAIGN_OFFER_DELIVERY
  ) {
    await campaignOfferDeliveryPaymentSuccess(
      metaData.campaignOfferId,
      transactionId,
      amount,
    );
  }
};

const handleCampaignRunPaymentSuccess = async (
  campaignId: string,
  transactionId: string,
  amount: number,
) => {
  console.log(campaignId, transactionId, amount);
  const campaign = await Campaign.findOne({
    _id: campaignId,
    paymentStatus: ENUM_PAYMENT_STATUS.PENDING,
  });
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pending campaign not found');
  }

  // update campaign
  await Campaign.findByIdAndUpdate(
    campaignId,
    {
      paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
      paymentIntentId: transactionId,
    },
    { new: true, runValidators: true },
  );
  // create transaction
  await Transaction.create({
    user: campaign.bussiness,
    amount,
    transactionId,
    transactionReason: ENUM_TRANSACTION_REASON.CAMPAIGN_PAYMENT,
    userType: 'Bussiness',
    type: ENUM_TRANSACTION_TYPE.DEBIT,
    description: `Payment for campaign is successful`,
    paymentMethod: ENUM_PAYMENT_METHOD.STRIPE,
  });
};
export default handlePaymentSuccess;
