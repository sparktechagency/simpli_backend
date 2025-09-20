/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import {
  ENUM_DELIVERY_STATUS,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';
import Bussiness from '../bussiness/bussiness.model';
import { Order } from '../order/order.model';
import Review from '../review/reviewer.model';

import moment from 'moment';
import Cart from '../cart/cart.model';

const getReviewerMetaData = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const { dateRange } = query;

  let currentDateFilter: Record<string, any> = {};
  let previousDateFilter: Record<string, any> = {};
  const today = moment().startOf('day');

  switch (dateRange) {
    case 'today':
      currentDateFilter = {
        createdAt: {
          $gte: today.toDate(),
          $lt: moment().endOf('day').toDate(),
        },
      };
      previousDateFilter = {
        createdAt: {
          $gte: moment().subtract(1, 'day').startOf('day').toDate(),
          $lt: moment().subtract(1, 'day').endOf('day').toDate(),
        },
      };
      break;

    case 'thisWeek':
      currentDateFilter = {
        createdAt: {
          $gte: today.startOf('week').toDate(),
          $lt: today.endOf('week').toDate(),
        },
      };
      previousDateFilter = {
        createdAt: {
          $gte: today.subtract(1, 'week').startOf('week').toDate(),
          $lt: today.startOf('week').toDate(),
        },
      };
      break;

    case 'lastWeek':
      currentDateFilter = {
        createdAt: {
          $gte: today.subtract(1, 'week').startOf('week').toDate(),
          $lt: today.startOf('week').toDate(),
        },
      };
      previousDateFilter = {
        createdAt: {
          $gte: today.subtract(2, 'week').startOf('week').toDate(),
          $lt: today.subtract(1, 'week').startOf('week').toDate(),
        },
      };
      break;

    case 'thisMonth':
      currentDateFilter = {
        createdAt: {
          $gte: today.startOf('month').toDate(),
          $lt: today.endOf('month').toDate(),
        },
      };
      previousDateFilter = {
        createdAt: {
          $gte: today.subtract(1, 'month').startOf('month').toDate(),
          $lt: today.startOf('month').toDate(),
        },
      };
      break;

    case 'lastMonth':
      currentDateFilter = {
        createdAt: {
          $gte: today.subtract(1, 'month').startOf('month').toDate(),
          $lt: today.startOf('month').toDate(),
        },
      };
      previousDateFilter = {
        createdAt: {
          $gte: today.subtract(2, 'month').startOf('month').toDate(),
          $lt: today.subtract(1, 'month').startOf('month').toDate(),
        },
      };
      break;

    case 'last6Months':
      currentDateFilter = {
        createdAt: { $gte: today.subtract(6, 'months').toDate() },
      };
      previousDateFilter = {
        createdAt: {
          $gte: today.subtract(12, 'months').toDate(),
          $lt: today.subtract(6, 'months').toDate(),
        },
      };
      break;

    case 'thisYear':
      currentDateFilter = {
        createdAt: { $gte: today.startOf('year').toDate() },
      };
      previousDateFilter = {
        createdAt: {
          $gte: today.subtract(1, 'year').startOf('year').toDate(),
          $lt: today.startOf('year').toDate(),
        },
      };
      break;

    default:
      currentDateFilter = {};
      previousDateFilter = {};
  }

  const currentTotalReview = await Review.countDocuments({
    reviewer: reviewerId,
    ...currentDateFilter,
  });
  const previousTotalReview = await Review.countDocuments({
    reviewer: reviewerId,
    ...previousDateFilter,
  });

  const currentTotalOrderShipment = await Order.countDocuments({
    reviewer: reviewerId,
    $or: [
      { deliveryStatus: ENUM_DELIVERY_STATUS.waiting },
      { deliveryStatus: ENUM_DELIVERY_STATUS.shipped },
    ],
    ...currentDateFilter,
  });

  const previousTotalOrderShipment = await Order.countDocuments({
    reviewer: reviewerId,
    $or: [
      { deliveryStatus: ENUM_DELIVERY_STATUS.waiting },
      { deliveryStatus: ENUM_DELIVERY_STATUS.shipped },
    ],
    ...previousDateFilter,
  });

  const currentReviewEarning = await Review.aggregate([
    {
      $match: {
        reviewer: new mongoose.Types.ObjectId(reviewerId),
        ...currentDateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const previousReviewEarning = await Review.aggregate([
    {
      $match: {
        reviewer: new mongoose.Types.ObjectId(reviewerId),
        ...previousDateFilter,
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const currentReferralEarning = await Order.aggregate([
    {
      $match: {
        'items.referral.reviewerId': new mongoose.Types.ObjectId(reviewerId),
        ...currentDateFilter,
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.referral.reviewerId': new mongoose.Types.ObjectId(reviewerId),
      },
    },
    { $group: { _id: null, total: { $sum: '$items.referral.amount' } } },
  ]);

  const previousReferralEarning = await Order.aggregate([
    {
      $match: {
        'items.referral.reviewerId': new mongoose.Types.ObjectId(reviewerId),
        ...previousDateFilter,
      },
    },
    { $unwind: '$items' },
    {
      $match: {
        'items.referral.reviewerId': new mongoose.Types.ObjectId(reviewerId),
      },
    },
    { $group: { _id: null, total: { $sum: '$items.referral.amount' } } },
  ]);

  const currentTotalEarning =
    (currentReviewEarning[0]?.total || 0) +
    (currentReferralEarning[0]?.total || 0);

  const previousTotalEarning =
    (previousReviewEarning[0]?.total || 0) +
    (previousReferralEarning[0]?.total || 0);

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0; // Avoid division by zero
    return ((current - previous) / previous) * 100;
  };

  return {
    totalEarning: {
      value: currentTotalEarning,
      change: getPercentageChange(currentTotalEarning, previousTotalEarning),
    },
    totalReview: {
      value: currentTotalReview,
      change: getPercentageChange(currentTotalReview, previousTotalReview),
    },
    itemInShipment: {
      value: Number(currentTotalOrderShipment.toFixed(2) || 0),
      change: getPercentageChange(
        currentTotalOrderShipment,
        previousTotalOrderShipment,
      ),
    },
  };
};

const getBussinessMetaData = async (
  bussinessId: string,
  query: Record<string, unknown>,
) => {
  const bussiness = await Bussiness.findById(bussinessId).select(
    'name currentBalance',
  );
  const totalOrder = await Order.countDocuments({
    bussiness: bussinessId,
    paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
  });

  // Checkout rate calculation (pseudo-aggregation)
  const cartsUsers = await Cart.distinct('reviewer', {
    items: { $exists: true, $ne: [] },
  });

  const ordersUsers = await Order.distinct('reviewer');

  const checkoutRate =
    cartsUsers.length > 0 ? (ordersUsers.length / cartsUsers.length) * 100 : 0;

  return {
    currentBalance: bussiness?.currentBalance || 0,
    totalOrder,
    checkoutRate: Number(checkoutRate.toFixed(2)) || 0,
  };
};

const MetaService = {
  getReviewerMetaData,
  getBussinessMetaData,
};
export default MetaService;
