/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import NormalUserServices from './normalUser.services';

const updateUserProfile = catchAsync(async (req, res) => {
  const file: any = req.files?.profile_image;
  if (req.files?.profile_image) {
    req.body.profile_image = getCloudFrontUrl(file[0].key);
  }
  const result = await NormalUserServices.updateUserProfile(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const NormalUserController = {
  updateUserProfile,
};

export default NormalUserController;
