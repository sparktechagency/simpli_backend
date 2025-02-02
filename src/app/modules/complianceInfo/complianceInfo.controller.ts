import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ComplianceInfoService from './complianceInfo.service';

const createComplianceInfo = catchAsync(async (req, res) => {
  const result = await ComplianceInfoService.createComplianceInfo(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Compliance Info created successfully',
    data: result,
  });
});
const updateComplianceInfo = catchAsync(async (req, res) => {
  const result = await ComplianceInfoService.editComplianceInfo(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Compliance Info created successfully',
    data: result,
  });
});

const deleteComplianceInfo = catchAsync(async (req, res) => {
  const result = await ComplianceInfoService.deleteComplianceInfo(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Compliance Info created successfully',
    data: result,
  });
});

const ComplianceInfoController = {
  createComplianceInfo,
  updateComplianceInfo,
  deleteComplianceInfo,
};

export default ComplianceInfoController;
