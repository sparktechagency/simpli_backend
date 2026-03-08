/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import httpStatus from 'http-status';
// import AppError from '../error/appError';
// import { CampaignOfferStatus } from '../modules/campaignOffer/campaignOffer.constant';
// import { CampaignOffer } from '../modules/campaignOffer/campaignOffer.model';
// import { ENUM_DELIVERY_STATUS } from '../utilities/enum';
// import shippo from '../utilities/shippo';

// const campaignOfferDeliveryPaymentSuccess = async (
//   campaignOfferId: string,
//   transactionId: string,
//   amount: number,
// ) => {
//   const campaignOffer = await CampaignOffer.findById(campaignOfferId);
//   if (!campaignOffer) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       'Order not found, Payment is completed but order is not created. Please contact support.',
//     );
//   }

//   // 1️ Update  status
//   campaignOffer.status = CampaignOfferStatus.processing;
//   campaignOffer.deliveryStatus = ENUM_DELIVERY_STATUS.waiting;

//   // 2️ Kick off Shippo label purchase if shipping rate selected
//   if (campaignOffer.shipping?.rateId) {
//     const transaction = await shippo.transactions.create({
//       rate: campaignOffer.shipping.rateId,
//     });

//     // Save Shippo transactionId so we can track it later in webhook
//     campaignOffer.shipping = {
//       ...campaignOffer.shipping,
//       status: 'QUEUED',
//       shipmentId: campaignOffer.shipping.shipmentId,
//       shippoTransactionId: transaction.objectId as string,
//     };
//   }

//   await campaignOffer.save();
// };

// export default campaignOfferDeliveryPaymentSuccess;

import { CampaignOfferStatus } from '../modules/campaignOffer/campaignOffer.constant';
import { CampaignOffer } from '../modules/campaignOffer/campaignOffer.model';
import { ENUM_NOTIFICATION_TYPE } from '../modules/notification/notification.enum';
import Notification from '../modules/notification/notification.model';
import { errorLogger, logger } from '../shared/logger';
import { ENUM_DELIVERY_STATUS } from '../utilities/enum';
import shippo from '../utilities/shippo';
import stripe from '../utilities/stripe';
const campaignOfferDeliveryPaymentSuccess = async (
  campaignOfferId: string,
  stripePaymentIntentId: string,
  amount: number,
) => {
  const id = '69880d6acac7ba3f27c85b60';
  const campaignOffer = await CampaignOffer.findById(id);
  if (!campaignOffer) {
    errorLogger.error('Campaign offer not found after payment');

    await stripe.refunds.create(
      { payment_intent: stripePaymentIntentId },
      { idempotencyKey: `refund-${stripePaymentIntentId}` },
    );

    return;
  }
  if (campaignOffer.shipping?.shippoTransactionId) {
    logger.info('Shippo label already created');
    return;
  }

  if (campaignOffer.status === CampaignOfferStatus.processing) {
    return;
  }
  try {
    if (!campaignOffer.shipping?.rateId) {
      errorLogger.error('Rate id not found for this campaign offer');
      return;
    }
    const transaction = await shippo.transactions.create({
      rate: campaignOffer.shipping?.rateId,
    });
    const validStatuses = ['QUEUED', 'SUCCESS', 'WAITING'];
    const status = transaction.status?.toUpperCase();
    if (!transaction.objectId || !validStatuses.includes(status as string)) {
      errorLogger.error(
        `Shippo label failed with status: ${transaction.status}`,
      );
      return;
    }

    campaignOffer.status = CampaignOfferStatus.processing;
    campaignOffer.deliveryStatus = ENUM_DELIVERY_STATUS.waiting;
    campaignOffer.shipping = {
      ...campaignOffer.shipping,
      status: 'QUEUED',
      shippoTransactionId: transaction.objectId as string,
    };
    await campaignOffer.save();
  } catch (shippoError) {
    errorLogger.error('Shippo label purchase failed:', shippoError);

    try {
      await stripe.refunds.create(
        { payment_intent: stripePaymentIntentId },
        { idempotencyKey: `refund-${stripePaymentIntentId}` },
      );

      await Notification.create({
        title: 'Failed to purchase shippo label',
        message:
          'Failed to purchase shippo label and you amount will be refund on you account',
        receiver: campaignOffer.business.toString(),
        data: {
          campaignOfferId: campaignOffer?._id,
        },
        type: ENUM_NOTIFICATION_TYPE.FAILED_GENERATE_SHIPPO_LEVEL,
      });
    } catch (refundError) {
      errorLogger.error(
        '[CRITICAL] Refund failed — manual action required!',
        refundError,
      );
      await Notification.create({
        title: 'Failed to purchase shippo label',
        message:
          'Failed to purchase shippo label and refund is failed please contact with support',
        receiver: campaignOffer.business.toString(),
        data: {
          campaignOfferId: campaignOffer?._id,
        },
        type: ENUM_NOTIFICATION_TYPE.FAILED_GENERATE_SHIPPO_LEVEL,
      });
    }

    campaignOffer.status = CampaignOfferStatus.accept;
    await campaignOffer.save();
    errorLogger.error('Shipping label creation failed. Payment refunded.');
    return;
  }
};

export default campaignOfferDeliveryPaymentSuccess;
