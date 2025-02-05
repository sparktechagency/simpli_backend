import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IComplianceInfo } from './complianceInfo.interface';
import ComplianceInfo from './complianceInfo.model';

const createComplianceInfo = async (
  profileId: string,
  payload: Partial<IComplianceInfo>,
) => {
  const result = await ComplianceInfo.create({
    ...payload,
    bussiness: profileId,
  });
  return result;
};

const editComplianceInfo = async (
  profileId: string,
  id: string,
  payload: Partial<IComplianceInfo>,
) => {
  const compliance = await ComplianceInfo.findOne({
    bussiness: profileId,
    _id: id,
  });
  if (!compliance) {
    throw new AppError(httpStatus.NOT_FOUND, 'Compliance info not found');
  }
  const result = await ComplianceInfo.findOneAndUpdate(
    { bussiness: profileId, _id: id },
    payload,
    { new: true, runValidators: true },
  );
  return result;
};

const deleteComplianceInfo = async (profileId: string, id: string) => {
  const compliance = await ComplianceInfo.findOne({
    bussiness: profileId,
    _id: id,
  });
  if (!compliance) {
    throw new AppError(httpStatus.NOT_FOUND, 'Compliance info not found');
  }
  const result = await ComplianceInfo.findOneAndDelete({
    bussiness: profileId,
    _id: id,
  });
  return result;
};

const getComplianceInfoForBussiness = async (bussinessId: string) => {
  const result = await ComplianceInfo.find({ bussiness: bussinessId });
  return result;
};

const ComplianceInfoService = {
  createComplianceInfo,
  deleteComplianceInfo,
  editComplianceInfo,
  getComplianceInfoForBussiness,
};

export default ComplianceInfoService;
