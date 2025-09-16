/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import shippo from '../../utilities/shippo';
import { Order } from '../order/order.model';
import {
  MAX_HEIGHT_IN,
  MAX_LENGTH_IN,
  MAX_WEIGHT_LB,
  MAX_WIDTH_IN,
} from './shippo.constant';
interface Parcel {
  length: number;
  width: number;
  height: number;
  weight: number;
  items: CartItem[];
}
interface CartItem {
  name: string;
  quantity: number;
  weight: number; // lbs
  length: number; // inches
  width: number;
  height: number;
}
export const generateParcels = (cartItems: CartItem[] | any): Parcel[] => {
  const parcels: Parcel[] = [];
  let currentParcel: Parcel = {
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    items: [],
  };

  cartItems.forEach((item: any) => {
    for (let i = 0; i < item.quantity; i++) {
      const newWeight = currentParcel.weight + item?.weight || 5;
      const newLength = currentParcel.length + item.length || 5;
      const newHeight = currentParcel.height + item.height || 5;
      const newWidth = Math.max(currentParcel.width, item.width || 5);

      // Check if adding this item exceeds carrier-safe limits
      if (
        newWeight > MAX_WEIGHT_LB ||
        newLength > MAX_LENGTH_IN ||
        newHeight > MAX_HEIGHT_IN ||
        newWidth > MAX_WIDTH_IN
      ) {
        // Save current parcel and start a new one
        parcels.push(currentParcel);
        currentParcel = {
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          items: [item],
        };
      } else {
        // Add item to current parcel
        currentParcel.weight = newWeight;
        currentParcel.length = newLength;
        currentParcel.width = newWidth;
        currentParcel.height = newHeight;
        currentParcel.items.push(item);
      }
    }
  });

  parcels.push(currentParcel); // add the last parcel
  return parcels;
};

export const convertToShippoParcels = (parcels: Parcel[]) => {
  return parcels.map((p) => ({
    length: p.length.toString(),
    width: p.width.toString(),
    height: p.height.toString(),
    distanceUnit: 'in',
    weight: p.weight.toString(),
    massUnit: 'lb',
  }));
};
export const purchaseShippingLabelForOrder = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order || !order.shipping?.rateId)
    throw new AppError(httpStatus.BAD_REQUEST, 'No shipping rate selected');

  const transaction = await shippo.transactions.create({
    rate: order.shipping.rateId,
    labelFileType: 'PDF',
    async: false,
  });

  order.shipping.trackingNumber = transaction.trackingNumber;
  order.shipping.labelUrl = transaction.labelUrl;
  order.shipping.status = transaction.status; // SUCCESS, ERROR, etc.

  await order.save();
  return order;
};
