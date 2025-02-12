import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IShippingAddress } from './shippingAddress.interface';
import ShippingAddress from './shippingAddress.model';
const createShippingAddress = async (
  reviewerId: string,
  payload: IShippingAddress,
) => {
  const result = await ShippingAddress.create({
    ...payload,
    reviewer: reviewerId,
  });
  return result;
};

const updateShippingAddress = async (
  reviewerId: string,
  id: string,
  payload: Partial<IShippingAddress>,
) => {
  const shippingAddress = await ShippingAddress.findOne({
    reviewer: reviewerId,
    _id: id,
  });
  if (!shippingAddress) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shipping address not found');
  }
  const result = await ShippingAddress.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const ShippingAddressService = {
  createShippingAddress,
  updateShippingAddress,
};
export default ShippingAddressService;
