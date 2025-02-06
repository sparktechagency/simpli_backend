import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IBussiness } from './bussiness.interface';
import Bussiness from './bussiness.model';
import unlinkFile from '../../helper/unLinkFile';

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

const updateBussinessInfoIntoDB = async (
  bussinessId: string,
  payload: Partial<IBussiness>,
) => {
  const bussiness = await Bussiness.findById(bussinessId);
  if (!bussiness) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bussiness not found');
  }

  const result = await Bussiness.findByIdAndUpdate(bussinessId, payload, {
    new: true,
    runValidators: true,
  });

  //!TODO : if you use external could for files you need to change here
  if (payload.bussinessLicense) {
    unlinkFile(bussiness?.bussinessLicense);
  }
  if (payload.incorparationCertificate) {
    unlinkFile(bussiness.incorparationCertificate);
  }
  if (payload.coverImage) {
    unlinkFile(bussiness.coverImage);
  }
  if (payload.logo) {
    unlinkFile(bussiness.logo);
  }
  return result;
};
const BussinessService = {
  addBussinessInformation,
  addBussinessDocumentIntoDB,
  updateBussinessInfoIntoDB,
};

export default BussinessService;
