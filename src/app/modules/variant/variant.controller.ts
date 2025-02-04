import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import VariantService from './variant.service';

const createVariant = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'variant_image' in files) {
    req.body.images = files['variant_image'].map((file) => file.path);
  }
  const result = await VariantService.createVariantIntoDB(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product variant created successfully',
    data: result,
  });
});

// update variant
const updateVariant = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'variant_image' in files) {
    const newImages = files['variant_image'].map((file) => file.path);
    req.body.images.push(...newImages);
  }
  const result = await VariantService.updateVariantIntoDB(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variant created successfully',
    data: result,
  });
});

// delete variant
const deleteVariant = catchAsync(async (req, res) => {
  const result = await VariantService.deleteVarintFromDB(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variant deleted successfully',
    data: result,
  });
});

// get product variant

const getProductVariant = catchAsync(async (req, res) => {
  const result = await VariantService.getProductVariant(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variant retrieved successfully',
    data: result,
  });
});

const VariantController = {
  createVariant,
  updateVariant,
  deleteVariant,
  getProductVariant,
};

export default VariantController;
