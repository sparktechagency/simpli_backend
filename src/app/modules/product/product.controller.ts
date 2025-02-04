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

const ProductController = {
  createProduct,
  saveProductAsDraft,
};

export default ProductController;
