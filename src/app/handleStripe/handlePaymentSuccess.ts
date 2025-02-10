/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import httpStatus from 'http-status';
import AppError from '../error/appError';
import Campaign from '../modules/campaign/campaign.model';
import {
  ENUM_PAYMENT_PURPOSE,
  ENUM_PAYMENT_STATUS,
  ENUM_TRANSACTION_STATUS,
} from '../utilities/enum';
import Transaction from '../modules/transaction/transaction.model';

const handlePaymentSuccess = async (
  metaData: any,
  transactionId: string,
  amount: number,
) => {
  console.log(transactionId, amount);
  if (metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.CAMPAIGN_RUN) {
    console.log('payment purpucse');
    await handleCampaignRunPaymentSuccess(
      metaData.campaignId,
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
    item: 'Campaign run payment',
    amount,
    paymentSender: campaign.bussiness,
    transactionId,
    status: ENUM_TRANSACTION_STATUS.SUCCESS,
  });
};
export default handlePaymentSuccess;
