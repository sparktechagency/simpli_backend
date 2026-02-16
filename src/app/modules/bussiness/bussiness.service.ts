import httpStatus from 'http-status';
import { deleteFileFromS3 } from '../../aws/deleteFromS2';
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

  if (payload.bussinessLicense) {
    if (bussiness.bussinessLicense) {
      deleteFileFromS3(bussiness?.bussinessLicense);
    }
  }
  if (payload.incorparationCertificate) {
    if (bussiness.incorparationCertificate) {
      deleteFileFromS3(bussiness.incorparationCertificate);
    }
  }
  if (payload.coverImage) {
    if (bussiness.coverImage) {
      deleteFileFromS3(bussiness.coverImage);
    }
  }
  if (payload.logo) {
    if (bussiness.logo) {
      deleteFileFromS3(bussiness.logo);
    }
  }
  return result;
};

const getBussinessProfile = async (profileId: string) => {
  const result = await Bussiness.findById(profileId);
  return result;
};

const getSingleBusinessById = async (id: string) => {
  const result = await Bussiness.findById(id).select(
    'bussinessName logo bio phoneNumber email createdAt',
  );
  return result;
};

const BussinessService = {
  addBussinessInformation,
  addBussinessDocumentIntoDB,
  updateBussinessInfoIntoDB,
  getBussinessProfile,
  getSingleBusinessById,
};

export default BussinessService;
