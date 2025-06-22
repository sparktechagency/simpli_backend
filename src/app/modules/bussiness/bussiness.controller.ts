/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import BussinessService from './bussiness.service';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';

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
  const bussinessLicenseFile: any = req.files?.bussinessLicense;
  if (req.files?.bussinessLicense) {
    req.body.bussinessLicense = getCloudFrontUrl(bussinessLicenseFile[0].key);
  }

  const incorparationCertificateFile: any = req.files?.bussinessLicense;
  if (req.files?.incorparationCertificate) {
    req.body.incorparationCertificate = getCloudFrontUrl(
      incorparationCertificateFile[0].key,
    );
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
  const bussinessLicenseFile: any = req.files?.bussinessLicense;
  if (req.files?.bussinessLicense) {
    req.body.bussinessLicense = getCloudFrontUrl(bussinessLicenseFile[0].key);
  }

  const incorparationCertificateFile: any = req.files?.bussinessLicense;
  if (req.files?.incorparationCertificate) {
    req.body.incorparationCertificate = getCloudFrontUrl(
      incorparationCertificateFile[0].key,
    );
  }
  const coverImageFile: any = req.files?.coverImage;
  if (req.files?.coverImage) {
    req.body.coverImage = getCloudFrontUrl(coverImageFile[0].key);
  }
  const logo: any = req.files?.logo;
  if (req.files?.logo) {
    req.body.logo = getCloudFrontUrl(logo[0].key);
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
