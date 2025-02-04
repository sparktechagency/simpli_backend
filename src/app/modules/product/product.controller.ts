import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ProductService from './product.service';

const createProduct = catchAsync(async (req, res) => {
  const result = await ProductService.createProductIntoDB(
    req.user.profileId,
    req.body,
    req.files,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const saveProductAsDraft = catchAsync(async (req, res) => {
  const result = await ProductService.saveProductAsDraftIntoDB(
    req.user.profileId,
    req.body,
    req.files,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product save as draft successfully',
    data: result,
  });
});
const publishProductFromDraft = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'product_image' in files) {
    const newImages = files['product_image'].map((file) => file.path);
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

const ProductController = {
  createProduct,
  saveProductAsDraft,
  publishProductFromDraft,
};

export default ProductController;
