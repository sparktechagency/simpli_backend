import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import BussinessService from './bussiness.service';

const addBussinessInformation = catchAsync(async (req, res) => {
  const result = await BussinessService.addBussinessInformation(
    req.user.profileId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bussiness information added successfully',
    data: result,
  });
});

// add bussiness documents
const addBussinessDocument = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'bussinessLicense' in files) {
    req.body.bussinessLicense = files['bussinessLicense'][0].path;
  }
  if (
    files &&
    typeof files === 'object' &&
    'incorparationCertificate' in files
  ) {
    req.body.incorparationCertificate =
      files['incorparationCertificate'][0].path;
  }

  const result = await BussinessService.addBussinessDocumentIntoDB(
    req.user.profileId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bussiness document added successfully',
    data: result,
  });
});

const updateBussinessInfo = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'bussinessLicense' in files) {
    req.body.bussinessLicense = files['bussinessLicense'][0].path;
  }
  if (
    files &&
    typeof files === 'object' &&
    'incorparationCertificate' in files
  ) {
    req.body.incorparationCertificate =
      files['incorparationCertificate'][0].path;
  }
  if (files && typeof files === 'object' && 'coverImage' in files) {
    req.body.coverImage = files['coverImage'][0].path;
  }
  if (files && typeof files === 'object' && 'logo' in files) {
    req.body.logo = files['logo'][0].path;
  }

  const result = await BussinessService.updateBussinessInfoIntoDB(
    req.user.profileId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bussiness updated successfully',
    data: result,
  });
});
const getBussinessProfile = catchAsync(async (req, res) => {
  const result = await BussinessService.getBussinessProfile(req.user.profileId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bussiness profile retrieved successfully',
    data: result,
  });
});

const BussinessController = {
  addBussinessInformation,
  addBussinessDocument,
  updateBussinessInfo,
  getBussinessProfile,
};

export default BussinessController;
