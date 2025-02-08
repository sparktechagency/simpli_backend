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

const updateStoreIntoDB = async (
  profileId: string,
  id: string,
  payload: Partial<IStore>,
) => {
  const store = await Store.findOne({ bussiness: profileId, _id: id });
  if (!store) {
    throw new AppError(httpStatus.NOT_FOUND, 'Store not found');
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
