/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ProductService from './product.service';

const createProduct = catchAsync(async (req, res) => {
  if (req.files?.product_image) {
    req.body.images = req.files.product_image.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }

  const result = await ProductService.createProduct(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

// const saveProductAsDraft = catchAsync(async (req, res) => {
//   const result = await ProductService.saveProductAsDraftIntoDB(
//     req.user.profileId,
//     req.body,
//     req.files,
//   );
//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Product save as draft successfully',
//     data: result,
//   });
// });
const publishProductFromDraft = catchAsync(async (req, res) => {
  if (req.files?.product_image) {
    const newImages = req.files.product_image.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
    req.body.images.push(...newImages);
  }
  const result = await ProductService.publishProductFromDraft(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Publish product from draft successfully',
    data: result,
  });
});

// delete single publich product
const deleteSingleProduct = catchAsync(async (req, res) => {
  const result = await ProductService.deleteSingleProduct(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});
// delete single publich product
const softDeleteSingleProduct = catchAsync(async (req, res) => {
  const result = await ProductService.softDeleteSingleProduct(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product deleted permanently',
    data: result,
  });
});

// change product status

const changeProductStatus = catchAsync(async (req, res) => {
  const result = await ProductService.changeProductStatus(
    req.user.profileId,
    req.params.id,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product is now ${result?.status}`,
    data: result,
  });
});

const getAllProduct = catchAsync(async (req, res) => {
  const result = await ProductService.getAllProduct(
    req.query,
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product retrieved successfully`,
    data: result,
  });
});
const getSingleProduct = catchAsync(async (req, res) => {
  const result = await ProductService.getSingleProductFromDB(
    req.params.id,
    req?.user?.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product retrieved successfully`,
    data: result,
  });
});
const updateProduct = catchAsync(async (req, res) => {
  if (req.files?.product_image) {
    req.body.newImages = req.files.product_image.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }
  const result = await ProductService.updateProductIntoDB(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Product updated successfully`,
    data: result,
  });
});

const ProductController = {
  createProduct,
  // saveProductAsDraft,
  publishProductFromDraft,
  deleteSingleProduct,
  softDeleteSingleProduct,
  changeProductStatus,
  getAllProduct,
  getSingleProduct,
  updateProduct,
};

export default ProductController;
