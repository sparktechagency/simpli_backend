import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Cart from '../cart/cart.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createOrder = async (reviewerId: string, payload: Partial<IOrder>) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });

  if (!cart || cart.items.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have any items for order",
    );
  }

  const result = await Order.create({
    ...payload,
    ...cart,
  });

  await Cart.findOneAndDelete({ reviewer: reviewerId });

  return result;
};

const getMyOrders = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const orderQuery = new QueryBuilder(
    Order.find({ $or: [{ reviewer: profileId }, { bussiness: profileId }] }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return {
    meta,
    result,
  };
};

const OrderService = {
  createOrder,
  getMyOrders,
};

export default OrderService;
