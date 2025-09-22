// import { Request, Response } from 'express';
// import Campaign from '../modules/campaign/campaign.model';
// import { ENUM_PAYMENT_STATUS } from '../utilities/enum';

// const handleCampaignRunPaymentSuccess = async (
//   req: Request,
//   res: Response,
//   campaignId: string,
//   transactionId: string,
//   amount: number,
// ) => {
//   await Campaign.findByIdAndUpdate(campaignId, {
//     paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
//   });
//   return res.redirect(
//     `${process.env.PAYPAL_SUCCESS_URL}?campaign_id=${campaignId}&transaction_id=${transactionId}&amount=${amount}`,
//   );
// };

// export default handleCampaignRunPaymentSuccess;

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../error/appError';
import Campaign from '../modules/campaign/campaign.model';
import {
  ENUM_TRANSACTION_REASON,
  ENUM_TRANSACTION_TYPE,
} from '../modules/transaction/transaction.enum';
import { Transaction } from '../modules/transaction/transaction.model';
import { ENUM_PAYMENT_METHOD, ENUM_PAYMENT_STATUS } from '../utilities/enum';

const handleCampaignRunPaymentSuccess = async (
  req: Request,
  res: Response,
  campaignId: string,
  transactionId: string,
  amount: number,
) => {
  // 1️⃣ Find pending campaign
  const campaign = await Campaign.findOne({
    _id: campaignId,
    paymentStatus: ENUM_PAYMENT_STATUS.PENDING,
  });

  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pending campaign not found');
  }

  // 2️⃣ Update campaign payment info
  await Campaign.findByIdAndUpdate(
    campaignId,
    {
      paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
      paymentIntentId: transactionId,
    },
    { new: true, runValidators: true },
  );

  // 3️⃣ Record transaction
  await Transaction.create({
    user: campaign.bussiness,
    amount,
    transactionId,
    transactionReason: ENUM_TRANSACTION_REASON.CAMPAIGN_PAYMENT,
    userType: 'Bussiness',
    type: ENUM_TRANSACTION_TYPE.DEBIT,
    description: `Payment for campaign is successful`,
    paymentMethod: ENUM_PAYMENT_METHOD.STRIPE, // or PAYPAL depending on gateway
  });

  // 4️⃣ Redirect to frontend success page
  return res.redirect(
    `${process.env.PAYPAL_SUCCESS_URL}?campaign_id=${campaignId}&transaction_id=${transactionId}&amount=${amount}`,
  );
};

export default handleCampaignRunPaymentSuccess;
