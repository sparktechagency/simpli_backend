import { Request, Response } from 'express';
import Campaign from '../modules/campaign/campaign.model';
import { ENUM_PAYMENT_STATUS } from '../utilities/enum';

const handleCampaignRunPaymentSuccess = async (
  req: Request,
  res: Response,
  campaignId: string,
  transactionId: string,
  amount: number,
) => {
  await Campaign.findByIdAndUpdate(campaignId, {
    paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
  });
  return res.redirect(
    `${process.env.PAYPAL_SUCCESS_URL}?campaign_id=${campaignId}&transaction_id=${transactionId}&amount=${amount}`,
  );
};

export default handleCampaignRunPaymentSuccess;
