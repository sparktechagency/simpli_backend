/* eslint-disable @typescript-eslint/no-explicit-any */
import { ENUM_DELIVERY_STATUS } from '../../utilities/enum';
import Bussiness from '../bussiness/bussiness.model';
import { Order } from '../order/order.model';
import Review from '../review/reviewer.model';

import moment from 'moment';

const getReviewerMetaData = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const { dateRange } = query;

  let currentDateFilter: Record<string, any> = {};
  let previousDateFilter: Record<string, any> = {};
  const today = moment().startOf('day');

  switch (dateRange) {
    case 'Today':
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

    case 'This week':
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

    case 'Last week':
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

    case 'This month':
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

    case 'Last month':
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

    case 'Last 6 Month':
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

    case 'This Year':
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

  const currentTotalEarning = 2398;
  const previousTotalEarning = 3996;

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
      value: currentTotalOrderShipment.toFixed,
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
  const totalEarning = 100;
  const bussiness = await Bussiness.findById(bussinessId);
  return {
    totalEarning,
    bussiness,
  };
};

const MetaService = {
  getReviewerMetaData,
  getBussinessMetaData,
};
export default MetaService;
