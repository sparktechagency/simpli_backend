// import { Request, Response } from 'express';
// import config from '../config';
// import { Order } from '../modules/order/order.model';
// import { ENUM_PAYMENT_STATUS } from '../utilities/enum';

// const handleOrderPaymentSuccess = async (
//   req: Request,
//   res: Response,
//   orderId: string,
//   transactionId: string,
//   amount: number,
// ) => {
//   await Order.findByIdAndUpdate(orderId, {
//     paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
//   });

//   // TODO: create transaction

//   // then rediract
//   return res.redirect(
//     `${config.stripe.stripe_order_payment_success_url}?orderId=${orderId}&transaction_id=${transactionId}&amount=${amount}`,
//   );
// };

// export default handleOrderPaymentSuccess;

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../error/appError';
import { shouldSendNotification } from '../helper/shouldSendNotification';
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
import { ENUM_PAYMENT_METHOD, ENUM_PAYMENT_STATUS } from '../utilities/enum';
import shippo from '../utilities/shippo';

const handleOrderPaymentSuccess = async (
  req: Request,
  res: Response,
  orderId: string,
  transactionId: string,
  amount: number,
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Order not found, Payment completed but order missing. Please contact support.',
    );
  }

  // 1️⃣ Update payment status
  order.paymentStatus = ENUM_PAYMENT_STATUS.SUCCESS;

  // 2️⃣ Shippo label purchase if shipping rate available
  if (order.shipping?.rateId) {
    const transaction = await shippo.transactions.create({
      rate: order.shipping.rateId,
    });

    order.shipping = {
      ...order.shipping,
      status: 'QUEUED',
      shipmentId: order.shipping.shipmentId,
      shippoTransactionId: transaction.objectId as string,
    };
  }

  await order.save();

  // 3️⃣ Referral earnings update
  const referralPromises = order.items.map(async (item) => {
    if (item.referral && typeof item.referral.amount === 'number') {
      const reviewerUpdatePromise = Reviewer.findByIdAndUpdate(
        item.referral.reviewerId,
        {
          $inc: {
            totalEarning: item.referral.amount,
            currentBalance: item.referral.amount,
          },
        },
      );

      const reviewUpdatePromise = Review.findByIdAndUpdate(
        item.referral.reviewId,
        {
          $inc: {
            totalReferralSales: 1,
            totalCommissions: item.referral.amount,
          },
        },
      );

      await Promise.all([reviewerUpdatePromise, reviewUpdatePromise]);
    }
  });

  await Promise.all(referralPromises);

  // 4️⃣ Record payment transaction
  await Transaction.create({
    user: order.reviewer,
    amount,
    transactionId,
    transactionReason: ENUM_TRANSACTION_REASON.CAMPAIGN_PAYMENT,
    userType: 'Reviewer',
    type: ENUM_TRANSACTION_TYPE.DEBIT,
    description: `Payment for order successful`,
    paymentMethod: ENUM_PAYMENT_METHOD.STRIPE,
  });

  // 5️⃣ Notify business
  if (
    await shouldSendNotification(
      ENUM_NOTIFICATION_TYPE.ORDER,
      order.bussiness.toString(),
    )
  ) {
    await Notification.create({
      receiver: order.bussiness.toString(),
      type: ENUM_NOTIFICATION_TYPE.ORDER,
      title: 'New Order Placed',
      message: `A new order has been placed. See your order details.`,
      data: {
        orderId: order._id,
      },
    });
  }

  // 6️⃣ Redirect back to frontend success page
  return res.redirect(
    `${config.stripe.stripe_order_payment_success_url}?orderId=${orderId}&transaction_id=${transactionId}&amount=${amount}`,
  );
};

export default handleOrderPaymentSuccess;
