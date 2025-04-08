/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Cart from '../cart/cart.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import paypal from '@paypal/checkout-server-sdk';
import {
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
} from '../../utilities/enum';
import stripe from '../../utilities/stripe';
import paypalClient from '../../utilities/paypal';
import config from '../../config';

const createOrder = async (reviewerId: string, payload: Partial<IOrder>) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });

  if (!cart || cart.items.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You don't have any items for order",
    );
  }

  const result: any = await Order.create({
    ...payload,
    ...cart,
  });

  const amountInCents = result.totalPrice * 100;

  // for payment
  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Campaign Run' },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: result._id.toString(),
        paymentPurpose: ENUM_PAYMENT_PURPOSE.ORDER,
      },
      success_url: config.stripe.stripe_order_payment_success_url,
      cancel_url: config.stripe.stripe_order_payment_cancel_url,
    });

    return { url: session.url };
  }

  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: result.totalPrice.toFixed(2),
            },
            description: `Payment for Campaign: ${result._id}`,
            custom_id: result?._id.toString(),
            reference_id: ENUM_PAYMENT_PURPOSE.ORDER,
          },
        ],
        application_context: {
          brand_name: 'Your Business Name',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: `${config.paypal.payment_capture_url}`,
          cancel_url: `${config.stripe.stripe_order_payment_cancel_url}`,
        },
      });

      const response = await paypalClient.execute(request);
      const approvalUrl = response.result.links.find(
        (link: any) => link.rel === 'approve',
      )?.href;

      if (!approvalUrl) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'PayPal payment creation failed: No approval URL found',
        );
      }

      return { url: approvalUrl };
    } catch (error) {
      console.error('PayPal Payment Error:', error);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create PayPal order',
      );
    }
  }

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
