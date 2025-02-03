import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Bussiness from '../bussiness/bussiness.model';
import { IStore } from './store.interface';
import { Store } from './store.model';

const createStore = async (profileId: string, payload: IStore) => {
  const bussiness = await Bussiness.findById(profileId);
  if (!bussiness) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bussiness not found');
  }
  const result = await Store.create({ ...payload, bussiness: profileId });
  return result;
};

const StoreService = {
  createStore,
};

export default StoreService;
