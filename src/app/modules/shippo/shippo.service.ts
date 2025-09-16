/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import {
  AddressCreateRequest,
  DistanceUnitEnum,
  ParcelCreateRequest,
  Shippo,
  WeightUnitEnum,
} from 'shippo';
import config from '../../config';
import AppError from '../../error/appError';
import Cart from '../cart/cart.model';
import ShippingAddress from '../shippingAddress/shippingAddress.model';
import { Store } from '../store/store.model';
import { generateParcels } from './shippo.helper';
const shippo = new Shippo({ apiKeyHeader: config.shippo.api_key as string });

const getShippingOptions = async (
  businessId: string,
  shippingAddressId: string,
  parcel: any,
) => {
  // const store = await Store.findOne({ bussiness: businessId });
  // if (!store) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Store not found');
  // }

  // const shippingAddress: IShippingAddress | null =
  //   await ShippingAddress.findById(shippingAddressId);
  // if (!shippingAddress) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Shipping address not found');
  // }

  // Create shipment with Shippo to get available rates
  const addressFrom: AddressCreateRequest = {
    name: 'Shawn Ippotle',
    street1: '215 Clayton St.',
    city: 'San Francisco',
    state: 'CA',
    zip: '94117',
    country: 'US',
  };

  const addressTo: AddressCreateRequest = {
    name: 'Mr Hippo',
    street1: 'Broadway 1',
    city: 'New York',
    state: 'NY',
    zip: '10007',
    country: 'US',
  };

  const parcel3: ParcelCreateRequest = {
    length: '15',
    width: '15',
    height: '5',
    distanceUnit: DistanceUnitEnum.In,
    weight: '20',
    massUnit: WeightUnitEnum.Lb,
  };

  const shipment = await shippo.shipments.create({
    addressFrom: addressFrom,
    addressTo: addressTo,
    parcels: [parcel3],
    async: false,
  });

  console.log('shipment', shipment);

  return shipment.rates;
};

const getShippingRatesForCheckout = async (
  reviewerId: string,
  shippingAddressId: string,
) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });
  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cart is empty');
  }

  const shippingAddress = await ShippingAddress.findOne({
    _id: shippingAddressId,
    reviewer: reviewerId,
  });
  const store = await Store.findOne({ bussiness: cart.bussiness });
  console.log('store=========>', store);
  if (!store) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Store details not found,Contact with business owner',
    );
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

  // Return all available rates to frontend
  return shipment.rates;
};

const ShippoService = {
  getShippingOptions,
  getShippingRatesForCheckout,
};

export default ShippoService;
