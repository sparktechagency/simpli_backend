/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';

import { Shippo } from 'shippo';
import config from '../../config';
import AppError from '../../error/appError';
import { IShippingAddress } from './shippingAddress.interface';
import ShippingAddress from './shippingAddress.model';
const shippo = new Shippo({ apiKeyHeader: config.shippo.api_key as string });
// crate shipping address
const createShippingAddress = async (
  reviewerId: string,
  payload: IShippingAddress,
) => {
  const validatedAddress = await shippo.addresses.create({
    ...payload,
    validate: true,
  });
  // Ensure validation_results exists
  if (
    !validatedAddress.validationResults ||
    validatedAddress.validationResults.isValid !== true
  ) {
    const messages = validatedAddress.validationResults?.messages || [];
    const errorText =
      messages.map((m) => m.text).join('; ') ||
      'Invalid or undeliverable address provided.';
    throw new AppError(httpStatus.BAD_REQUEST, errorText);
  }

  const result = await ShippingAddress.create({
    ...payload,
    reviewer: reviewerId,
  });
  return result;
};

const updateShippingAddress = async (
  reviewerId: string,
  id: string,
  payload: IShippingAddress,
) => {
  const shippingAddress = await ShippingAddress.findOne({
    reviewer: reviewerId,
    _id: id,
  });
  if (!shippingAddress) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shipping address not found');
  }

  const validatedAddress = await shippo.addresses.create({
    ...payload,
    validate: true,
  });

  // Ensure validation_results exists
  if (
    !validatedAddress.validationResults ||
    validatedAddress.validationResults.isValid !== true
  ) {
    const messages = validatedAddress.validationResults?.messages || [];
    const errorText =
      messages.map((m) => m.text).join('; ') ||
      'Invalid or undeliverable address provided.';
    throw new AppError(httpStatus.BAD_REQUEST, errorText);
  }
  const result = await ShippingAddress.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getShippingAddress = async (profileId: string) => {
  const result = await ShippingAddress.find({
    reviewer: profileId,
    isDeleted: false,
  });
  return result;
};
const deleteShippingAddress = async (profileId: string, id: string) => {
  const result = await ShippingAddress.findOneAndUpdate(
    {
      reviewer: profileId,
      _id: id,
    },
    { isDeleted: true },
    { new: true, runValidators: true },
  );
  return result;
};

const ShippingAddressService = {
  createShippingAddress,
  updateShippingAddress,
  getShippingAddress,
  deleteShippingAddress,
};
export default ShippingAddressService;
