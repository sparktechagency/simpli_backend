import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Cart from '../cart/cart.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';

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

const OrderService = {
  createOrder,
};

export default OrderService;
