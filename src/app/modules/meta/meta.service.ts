import { ENUM_DELIVERY_STATUS } from '../../utilities/enum';
import { Order } from '../order/order.model';
import Review from '../review/reviewer.model';

const getReviewerMetaData = async (
  reviewerId: string,
  query: Record<string, unknown>,
) => {
  const totalEarning = 0;
  const totalReview = await Review.countDocuments();
  const totalOrderShipment = await Order.find({
    reviewer: reviewerId,
    $or: [
      { deliveryStatus: ENUM_DELIVERY_STATUS.waiting },
      { deliveryStatus: ENUM_DELIVERY_STATUS.shipped },
    ],
  });

  return {
    totalEarning,
    totalReview,
    itemInShipment: totalOrderShipment,
  };
};

const MetaService = {
  getReviewerMetaData,
};
export default MetaService;
