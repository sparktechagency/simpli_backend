// /* eslint-disable no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import httpStatus from 'http-status';
// import AppError from '../error/appError';
// import { shouldSendNotification } from '../helper/shouldSendNotification';
// import { ENUM_NOTIFICATION_TYPE } from '../modules/notification/notification.enum';
// import Notification from '../modules/notification/notification.model';
// import { Order } from '../modules/order/order.model';
// import Review from '../modules/review/reviewer.model';
// import Reviewer from '../modules/reviewer/reviewer.model';
// import {
//   ENUM_TRANSACTION_REASON,
//   ENUM_TRANSACTION_TYPE,
// } from '../modules/transaction/transaction.enum';
// import { Transaction } from '../modules/transaction/transaction.model';
// import { ENUM_PAYMENT_METHOD, ENUM_PAYMENT_STATUS } from '../utilities/enum';
// import shippo from '../utilities/shippo';
// const handleOrderPaymentSuccess = async (
//   orderId: string,
//   transactionId: string,
//   amount: number,
// ) => {
//   const order = await Order.findById(orderId);
//   if (!order) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       'Order not found, Payment is completed but order is not created. Please contact support.',
//     );
//   }

//   // 1️⃣ Update payment status
//   order.paymentStatus = ENUM_PAYMENT_STATUS.SUCCESS;

//   // 2️⃣ Kick off Shippo label purchase if shipping rate selected
//   if (order.shipping?.rateId) {
//     const transaction = await shippo.transactions.create({
//       rate: order.shipping.rateId,
//     });

//     // Save Shippo transactionId so we can track it later in webhook
//     order.shipping = {
//       ...order.shipping,
//       status: 'QUEUED',
//       shipmentId: order.shipping.shipmentId,
//       shippoTransactionId: transaction.objectId as string,
//     };
//   }

//   await order.save();

//   // 3️⃣ Referral updates (same as before)
//   const referralPromises = order.items.map(async (item) => {
//     if (item.referral && typeof item.referral.amount === 'number') {
//       const reviewerUpdatePromise = Reviewer.findByIdAndUpdate(
//         item.referral.reviewerId,
//         {
//           $inc: {
//             totalEarning: item.referral.amount,
//             currentBalance: item.referral.amount,
//           },
//         },
//       );

//       const reviewUpdatePromise = Review.findByIdAndUpdate(
//         item.referral.reviewId,
//         {
//           $inc: {
//             totalReferralSales: 1,
//             totalCommissions: item.referral.amount,
//           },
//         },
//       );

//       await Promise.all([reviewerUpdatePromise, reviewUpdatePromise]);
//     }
//   });

//   await Promise.all(referralPromises);

//   // create transaction
//   await Transaction.create({
//     user: order.reviewer,
//     amount,
//     transactionId,
//     transactionReason: ENUM_TRANSACTION_REASON.CAMPAIGN_PAYMENT,
//     userType: 'Reviewer',
//     type: ENUM_TRANSACTION_TYPE.DEBIT,
//     description: `Payment for order is successful`,
//     paymentMethod: ENUM_PAYMENT_METHOD.STRIPE,
//   });

//   if (
//     !shouldSendNotification(
//       ENUM_NOTIFICATION_TYPE.ORDER,
//       order.bussiness.toString(),
//     )
//   ) {
//     return;
//   } else {
//     Notification.create({
//       receiver: order.bussiness.toString(),
//       type: ENUM_NOTIFICATION_TYPE.ORDER,
//       title: 'New Order Placed',
//       message: `A new order has been placed. See your order details.`,
//       data: {
//         orderId: order._id,
//       },
//     });
//   }
// };

// export default handleOrderPaymentSuccess;

// export default handleOrderPaymentSuccess;
import mongoose from 'mongoose';
import { ENUM_NOTIFICATION_TYPE } from '../modules/notification/notification.enum';
import Notification from '../modules/notification/notification.model';
import { Order } from '../modules/order/order.model';
import Review from '../modules/review/reviewer.model';
import Reviewer from '../modules/reviewer/reviewer.model';
import {
  ENUM_TRANSACTION_REASON,
  ENUM_TRANSACTION_TYPE,
} from '../modules/transaction/transaction.enum';
import { Transaction } from '../modules/transaction/transaction.model';
import { errorLogger, logger } from '../shared/logger';
import { ENUM_PAYMENT_METHOD, ENUM_PAYMENT_STATUS } from '../utilities/enum';
import shippo from '../utilities/shippo';
import stripe from '../utilities/stripe';

const handleOrderPaymentSuccess = async (
  orderId: string,
  stripePaymentIntentId: string,
  amount: number,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      errorLogger.error(`Order not found after payment: ${orderId}`);
      try {
        await stripe.refunds.create(
          { payment_intent: stripePaymentIntentId },
          { idempotencyKey: `refund-${stripePaymentIntentId}` },
        );
        logger.info(`Refund issued for unknown order ${orderId}`);
      } catch (refundError) {
        errorLogger.error(
          `Refund failed for unknown order ${orderId}`,
          refundError,
        );
      }
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Skip if already refunded or processed
    if (
      [ENUM_PAYMENT_STATUS.REFUNDED, ENUM_PAYMENT_STATUS.SUCCESS].includes(
        order.paymentStatus,
      ) ||
      order.shipping?.shippoTransactionId
    ) {
      logger.info(`Order ${orderId} already processed. Skipping webhook.`);
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Mark payment as successful
    order.paymentStatus = ENUM_PAYMENT_STATUS.SUCCESS;

    // Shippo label creation
    if (order.shipping?.rateId) {
      const transaction = await shippo.transactions.create({
        rate: order.shipping.rateId,
      });
      const validStatuses = ['QUEUED', 'SUCCESS', 'WAITING'];
      const status = transaction.status?.toUpperCase();

      if (!transaction.objectId || !validStatuses.includes(status as string)) {
        throw new Error(
          `Shippo label creation failed with status: ${transaction.status}`,
        );
      }

      order.shipping = {
        ...order.shipping,
        status: 'QUEUED',
        shipmentId: order.shipping.shipmentId,
        shippoTransactionId: transaction.objectId as string,
      };
      logger.info(`Shippo label created for order ${orderId}`);
    }

    await order.save({ session });

    // Referral updates
    const referralPromises = order.items.map(async (item) => {
      if (item.referral?.amount) {
        await Promise.all([
          Reviewer.findByIdAndUpdate(
            item.referral.reviewerId,
            {
              $inc: {
                totalEarning: item.referral.amount,
                currentBalance: item.referral.amount,
              },
            },
            { session },
          ),
          Review.findByIdAndUpdate(
            item.referral.reviewId,
            {
              $inc: {
                totalReferralSales: 1,
                totalCommissions: item.referral.amount,
              },
            },
            { session },
          ),
        ]);
      }
    });
    await Promise.all(referralPromises);

    // Create transaction for reviewer
    await Transaction.create(
      [
        {
          user: order.reviewer,
          amount,
          transactionId: stripePaymentIntentId,
          transactionReason: ENUM_TRANSACTION_REASON.ORDER,
          userType: 'Reviewer',
          type: ENUM_TRANSACTION_TYPE.DEBIT,
          description: `Payment for order is successful`,
          paymentMethod: ENUM_PAYMENT_METHOD.STRIPE,
        },
      ],
      { session },
    );

    // Notify business-------
    await Notification.create(
      {
        receiver: order.bussiness.toString(),
        type: ENUM_NOTIFICATION_TYPE.ORDER,
        title: 'New Order Placed',
        message: `A new order has been placed. See your order details.`,
        data: { orderId: order._id },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    errorLogger.error(`Error processing order ${orderId} webhook`, err);

    // Refund if shippo failed
    try {
      await stripe.refunds.create(
        { payment_intent: stripePaymentIntentId },
        { idempotencyKey: `refund-${stripePaymentIntentId}` },
      );
      logger.info(`Refund issued for order ${orderId} due to error`);
    } catch (refundError) {
      errorLogger.error(
        `[CRITICAL] Refund failed for order ${orderId}`,
        refundError,
      );
    }

    // Notify business and reviewer
    if (err && err instanceof Error) {
      const order = await Order.findById(orderId);
      const notifications = [
        {
          receiver: order?.bussiness?.toString(),
          title: 'Order Payment Refund',
          message:
            'Payment refunded due to shipping label creation failure. Contact support.',
          type: ENUM_NOTIFICATION_TYPE.FAILED_GENERATE_SHIPPO_LEVEL,
        },
        {
          receiver: order?.reviewer?.toString(),
          title: 'Order Payment Refund',
          message:
            'Payment refunded due to shipping label creation failure. Your amount will be refunded to your account.',
          type: ENUM_NOTIFICATION_TYPE.FAILED_GENERATE_SHIPPO_LEVEL,
        },
      ];

      await Promise.all(
        notifications.map((n) =>
          Notification.create({ ...n, data: { orderId: order?._id } }),
        ),
      );

      // Mark order as refunded
      if (order) {
        order.paymentStatus = ENUM_PAYMENT_STATUS.REFUNDED;
        await order.save();
      }
    }
  }
};

export default handleOrderPaymentSuccess;
