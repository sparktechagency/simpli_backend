import httpStatus from 'http-status';
import AppError from '../../error/appError';
import shippo from '../../utilities/shippo';
import Bussiness from '../bussiness/bussiness.model';
import { IStore } from './store.interface';
import { Store } from './store.model';

const createStore = async (profileId: string, payload: IStore) => {
  console.log('DEBUG: Current Shippo Instance Key:', shippo);
  const bussiness = await Bussiness.findById(profileId);
  if (!bussiness) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bussiness not found');
  }
  const validatedAddress = await shippo.addresses.create({
    ...payload,
    validate: true,
  });

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
  const result = await Store.create({ ...payload, bussiness: profileId });
  return result;
};

const updateStoreIntoDB = async (
  profileId: string,
  id: string,
  payload: IStore,
) => {
  const store = await Store.findOne({ bussiness: profileId, _id: id });
  if (!store) {
    throw new AppError(httpStatus.NOT_FOUND, 'Store not found');
  }
  const validatedAddress = await shippo.addresses.create({
    ...payload,
    validate: true,
  });

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
  const result = await Store.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getBussinessStore = async (bussinessId: string) => {
  const result = await Store.find({ bussiness: bussinessId });
  return result;
};
const StoreService = {
  createStore,
  updateStoreIntoDB,
  getBussinessStore,
};

export default StoreService;
