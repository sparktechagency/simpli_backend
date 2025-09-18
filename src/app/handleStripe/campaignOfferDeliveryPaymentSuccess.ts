/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../error/appError';
import { CampaignOfferStatus } from '../modules/campaignOffer/campaignOffer.constant';
import { CampaignOffer } from '../modules/campaignOffer/campaignOffer.model';
import { ENUM_DELIVERY_STATUS } from '../utilities/enum';
import shippo from '../utilities/shippo';

const campaignOfferDeliveryPaymentSuccess = async (
  campaignOfferId: string,
  transactionId: string,
  amount: number,
) => {
  const campaignOffer = await CampaignOffer.findById(campaignOfferId);
  if (!campaignOffer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Order not found, Payment is completed but order is not created. Please contact support.',
    );
  }

  // 1️ Update  status
  campaignOffer.status = CampaignOfferStatus.processing;
  campaignOffer.deliveryStatus = ENUM_DELIVERY_STATUS.waiting;

  // 2️ Kick off Shippo label purchase if shipping rate selected
  if (campaignOffer.shipping?.rateId) {
    const transaction = await shippo.transactions.create({
      rate: campaignOffer.shipping.rateId,
    });

    // Save Shippo transactionId so we can track it later in webhook
    campaignOffer.shipping = {
      ...campaignOffer.shipping,
      status: 'QUEUED',
      shipmentId: campaignOffer.shipping.shipmentId,
      shippoTransactionId: transaction.objectId as string,
    };
  }

  await campaignOffer.save();
};

export default campaignOfferDeliveryPaymentSuccess;
