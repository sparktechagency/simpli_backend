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

const BussinessController = {
  addBussinessInformation,
  addBussinessDocument,
};

export default BussinessController;
