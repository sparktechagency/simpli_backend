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
import { IShippingAddress } from '../shippingAddress/shippingAddress.interface';
import ShippingAddress from '../shippingAddress/shippingAddress.model';
import { Store } from '../store/store.model';

const shippo = new Shippo({ apiKeyHeader: config.shippo.api_key as string });

const getShippingOptions = async (
  businessId: string,
  shippingAddressId: string,
  parcel: any,
) => {
  const store = await Store.findOne({ bussiness: businessId });
  if (!store) {
    throw new AppError(httpStatus.NOT_FOUND, 'Store not found');
  }

  const shippingAddress: IShippingAddress | null =
    await ShippingAddress.findById(shippingAddressId);
  if (!shippingAddress) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shipping address not found');
  }

  // const addressFrom: AddressCreateRequest = {
  //   name: store.name,
  //   street1: store.street1,
  //   street2: store.street2 || '',
  //   city: store.city,
  //   state: store.state,
  //   zip: store.zipCode.toString(),
  //   country: store.country,
  //   phone: store?.phone,
  //   email: store?.email,
  // };

  // const addressTo: AddressCreateRequest = {
  //   name: shippingAddress.name,
  //   street1: shippingAddress.street1,
  //   street2: shippingAddress.street2 || '',
  //   city: shippingAddress.city,
  //   state: shippingAddress.state,
  //   zip: shippingAddress.zipCode,
  //   country: shippingAddress.country,
  //   phone: shippingAddress?.phoneNumber,
  //   email: shippingAddress?.email,
  // };

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

  //   const parcel: ParcelCreateRequest = {
  //     length: '15',
  //     width: '15',
  //     height: '5',
  //     distanceUnit: DistanceUnitEnum.In,
  //     weight: '20',
  //     massUnit: WeightUnitEnum.Lb,
  //   };
  const parcel3: ParcelCreateRequest = {
    length: '15',
    width: '15',
    height: '5',
    distanceUnit: DistanceUnitEnum.In,
    weight: '20',
    massUnit: WeightUnitEnum.Lb,
  };

  //   const parcel2: ParcelCreateRequest = {
  //     length: '10',
  //     width: '10',
  //     height: '10',
  //     distanceUnit: DistanceUnitEnum.In,
  //     weight: '2',
  //     massUnit: WeightUnitEnum.Lb,
  //   };

  //   const shipment = await shippo.shipments.create({
  //     addressFrom: addressFrom,
  //     addressTo: addressTo,
  //     parcels: [parcel3],
  //     async: false,
  //   });

  const shipment = await shippo.shipments.create({
    addressFrom: addressFrom,
    addressTo: addressTo,
    parcels: [parcel3],
    async: false,
  });

  console.log('shipment', shipment);

  return shipment.rates;
};

const ShippoService = {
  getShippingOptions,
};

export default ShippoService;
