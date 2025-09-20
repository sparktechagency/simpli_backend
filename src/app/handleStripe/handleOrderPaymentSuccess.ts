/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../error/appError';
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
  orderId: string,
  transactionId: string,
  amount: number,
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Order not found, Payment is completed but order is not created. Please contact support.',
    );
  }

  // 1️⃣ Update payment status
  order.paymentStatus = ENUM_PAYMENT_STATUS.SUCCESS;

  // 2️⃣ Kick off Shippo label purchase if shipping rate selected
  if (order.shipping?.rateId) {
    const transaction = await shippo.transactions.create({
      rate: order.shipping.rateId,
    });

    // Save Shippo transactionId so we can track it later in webhook
    order.shipping = {
      ...order.shipping,
      status: 'QUEUED',
      shipmentId: order.shipping.shipmentId,
      shippoTransactionId: transaction.objectId as string,
    };
  }

  await order.save();

  // 3️⃣ Referral updates (same as before)
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

  // create transaction
  await Transaction.create({
    user: order.reviewer,
    amount,
    transactionId,
    transactionReason: ENUM_TRANSACTION_REASON.CAMPAIGN_PAYMENT,
    userType: 'Reviewer',
    type: ENUM_TRANSACTION_TYPE.DEBIT,
    description: `Payment for order is successful`,
    paymentMethod: ENUM_PAYMENT_METHOD.STRIPE,
  });
};

export default handleOrderPaymentSuccess;
