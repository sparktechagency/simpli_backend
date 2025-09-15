/* eslint-disable @typescript-eslint/no-explicit-any */
import paypal from '@paypal/checkout-server-sdk';
import axios from 'axios';
import httpStatus from 'http-status';
import { DistanceUnitEnum, ParcelCreateRequest, WeightUnitEnum } from 'shippo';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import AppError from '../../error/appError';
import {
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
} from '../../utilities/enum';
import paypalClient from '../../utilities/paypal';
import shippo from '../../utilities/shippo';
import stripe from '../../utilities/stripe';
import Cart from '../cart/cart.model';
import ShippingAddress from '../shippingAddress/shippingAddress.model';
import { generateParcels } from '../shippo/shippo.helper';
import { Store } from '../store/store.model';
import { IOrder } from './order.interface';
import { Order } from './order.model';

const createOrder = async (
  reviewerId: string,
  payload: Partial<IOrder> & { selectedRateId: string },
) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });
  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  let deliveryCharge = 0;
  let shippingInfo: any = null;

  if (payload.selectedRateId) {
    // User selected a shipping rate
    const shippingAddress = await ShippingAddress.findOne({
      _id: payload.shippingAddress,
      reviewer: reviewerId,
    });
    const store = await Store.findOne({ bussiness: cart.bussiness });
    if (!store) {
      throw new AppError(httpStatus.NOT_FOUND, 'Store details');
    }
    if (!shippingAddress)
      throw new AppError(httpStatus.NOT_FOUND, 'Shipping address not found');

    const parcels = generateParcels(cart.items);

    const shippoParcels: ParcelCreateRequest[] = parcels.map((p) => ({
      length: p.length.toString(),
      width: p.width.toString(),
      height: p.height.toString(),
      distanceUnit: DistanceUnitEnum.In, // ✅ use enum
      weight: p.weight.toString(),
      massUnit: WeightUnitEnum.Lb, // ✅ use enum
    }));

    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: store.name,
        street1: store.street1,
        city: store.city,
        state: store.state,
        zip: store.zip,
        country: store.country,
        phone: store.phone,
      },
      addressTo: {
        name: shippingAddress.name,
        street1: shippingAddress.street1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
      parcels: shippoParcels,
      async: false,
    });

    const selectedRate = shipment.rates.find(
      (r: any) => r.objectId === payload.selectedRateId,
    );
    if (!selectedRate)
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid shipping rate');

    deliveryCharge = parseFloat(selectedRate.amount);

    shippingInfo = {
      rateId: selectedRate.objectId,
      provider: selectedRate.provider,
      service: selectedRate.servicelevel.name,
      amount: deliveryCharge,
      currency: selectedRate.currency,
      shipmentId: shipment.objectId,
      status: 'PENDING', // not purchased yet
    };
  }

  // Total price including shipping
  const totalPrice = cart.totalPrice + deliveryCharge;

  // Create order
  const order: any = await Order.create({
    ...payload,
    reviewer: reviewerId,
    items: cart.items,
    totalPrice,
    deliveryCharge,
    shipping: shippingInfo,
  });

  // Payment handling
  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
    const amountInCents = totalPrice * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Order Payment' },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order._id.toString(),
        paymentPurpose: ENUM_PAYMENT_PURPOSE.ORDER,
      },
      success_url: config.stripe.stripe_order_payment_success_url,
      cancel_url: config.stripe.stripe_order_payment_cancel_url,
    });

    await Cart.findOneAndDelete({ reviewer: reviewerId });
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
              value: totalPrice.toFixed(2),
            },
            description: `Payment for Order: ${order._id}`,
            custom_id: order._id.toString(),
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
          'PayPal payment creation failed',
        );
      }

      await Cart.findOneAndDelete({ reviewer: reviewerId });
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
  return order;
};

// const createOrder = async (reviewerId: string, payload: Partial<IOrder>) => {
//   const cart = await Cart.findOne({ reviewer: reviewerId });

//   if (!cart || cart.items.length === 0) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "You don't have any items for order",
//     );
//   }

//   const result: any = await Order.create({
//     ...payload,
//     ...cart,
//   });

//   const amountInCents = result.totalPrice * 100;

//   // for payment
//   if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: { name: 'Campaign Run' },
//             unit_amount: amountInCents,
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         orderId: result._id.toString(),
//         paymentPurpose: ENUM_PAYMENT_PURPOSE.ORDER,
//       },
//       success_url: config.stripe.stripe_order_payment_success_url,
//       cancel_url: config.stripe.stripe_order_payment_cancel_url,
//     });

//     return { url: session.url };
//   }

//   if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
//     try {
//       const request = new paypal.orders.OrdersCreateRequest();
//       request.prefer('return=representation');
//       request.requestBody({
//         intent: 'CAPTURE',
//         purchase_units: [
//           {
//             amount: {
//               currency_code: 'USD',
//               value: result.totalPrice.toFixed(2),
//             },
//             description: `Payment for Campaign: ${result._id}`,
//             custom_id: result?._id.toString(),
//             reference_id: ENUM_PAYMENT_PURPOSE.ORDER,
//           },
//         ],
//         application_context: {
//           brand_name: 'Your Business Name',
//           landing_page: 'LOGIN',
//           user_action: 'PAY_NOW',
//           return_url: `${config.paypal.payment_capture_url}`,
//           cancel_url: `${config.stripe.stripe_order_payment_cancel_url}`,
//         },
//       });

//       const response = await paypalClient.execute(request);
//       const approvalUrl = response.result.links.find(
//         (link: any) => link.rel === 'approve',
//       )?.href;

//       if (!approvalUrl) {
//         throw new AppError(
//           httpStatus.INTERNAL_SERVER_ERROR,
//           'PayPal payment creation failed: No approval URL found',
//         );
//       }

//       return { url: approvalUrl };
//     } catch (error) {
//       console.error('PayPal Payment Error:', error);
//       throw new AppError(
//         httpStatus.INTERNAL_SERVER_ERROR,
//         'Failed to create PayPal order',
//       );
//     }
//   }

//   await Cart.findOneAndDelete({ reviewer: reviewerId });

//   return result;
// };

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

const getSingleOrder = async (profileId: string, orderId: string) => {
  const order = await Order.findOne({
    $or: [{ reviewer: profileId }, { bussiness: profileId }],
    _id: orderId,
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }
  const response = await axios.post(
    'https://api.goshippo.com/tracks/',
    new URLSearchParams({
      carrier: order.shipping?.provider as string,
      tracking_number: order.shipping?.trackingNumber as string,
      metadata: `Order : ${order._id}`,
    }),
    {
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  const trackingData = response.data;
  return {
    order,
    trackingData,
  };
};

const OrderService = {
  createOrder,
  getMyOrders,
  getSingleOrder,
};

export default OrderService;
