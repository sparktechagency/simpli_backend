/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../error/appError';
import { Order } from '../modules/order/order.model';
import { ENUM_PAYMENT_STATUS } from '../utilities/enum';
import Reviewer from '../modules/reviewer/reviewer.model';
import Review from '../modules/review/reviewer.model';
const handleOrderPaymentSuccess = async (
  orderId: string,
  transactionId: string,
  amount: number,
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Order not found , Payment is completed but order is not created so please contact with support',
    );
  }

  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
  });

  const referralPromises = order.items.map(async (item) => {
    if (item.referral) {
      // Update reviewer balance
      const reviewerUpdatePromise = Reviewer.findByIdAndUpdate(
        item.referral.reviewerId,
        {
          $inc: {
            totalEarning: item.referral.amount,
            currentBalance: item.referral.amount,
          },
        },
      );

      // Update review
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

  // TODO: create transaction
};

export default handleOrderPaymentSuccess;
