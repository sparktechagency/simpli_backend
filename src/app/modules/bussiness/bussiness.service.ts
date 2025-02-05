import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IBussiness } from './bussiness.interface';
import Bussiness from './bussiness.model';

const addBussinessInformation = async (
  profileId: string,
  payload: Partial<IBussiness>,
) => {
  const bussiness = await Bussiness.findById(profileId);
  if (!bussiness) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bussiness not found');
  }
  const result = await Bussiness.findByIdAndUpdate(
    profileId,
    { ...payload, isBussinessInfoProvided: true },
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

const addBussinessDocumentIntoDB = async (
  profileId: string,
  payload: Partial<IBussiness>,
) => {
  const bussiness = await Bussiness.findById(profileId);
  if (!bussiness) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bussiness not found');
  }
  const result = await Bussiness.findByIdAndUpdate(
    profileId,
    { ...payload, isBussinessDocumentProvided: true },
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};
const BussinessService = {
  addBussinessInformation,
  addBussinessDocumentIntoDB,
};

export default BussinessService;
