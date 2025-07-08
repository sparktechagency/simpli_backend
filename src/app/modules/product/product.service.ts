/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProduct } from './product.interface';
import Product from './product.model';
import Category from '../category/category.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';
import Bookmark from '../bookmark/bookmark.mode';
import { deleteFileFromS3 } from '../../aws/deleteFromS2';

// create product into db
// const createProductIntoDB = async (
//   profileId: string,
//   payload: IProduct,
//   files: any,
// ) => {
//   const category = await Category.findById(payload.category);
//   if (!category) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
//   }

//   let productImages: string[] = [];
//   if (Array.isArray(files)) {
//     productImages = files
//       .filter((file: any) => file.fieldname === 'product_image')
//       .map((file: any) => file.path);
//   }
//   // variant images
//   const variantImagesMap: { [key: string]: string[] } = {};
//   if (Array.isArray(files)) {
//     files.forEach((file: any) => {
//       if (file.fieldname.startsWith('variant_image_')) {
//         const sku = file.fieldname.replace('variant_image_', '');
//         if (!variantImagesMap[sku]) {
//           variantImagesMap[sku] = [];
//         }
//         variantImagesMap[sku].push(file.path);
//       }
//     });
//   }
//   const result = await Product.create({
//     ...payload,
//     bussiness: profileId,
//     images: productImages,
//   });

//   const updatedVariants = payload.variants.map((variant) => ({
//     ...variant,
//     images: variantImagesMap[variant.sku] || [],
//     product: result._id,
//     bussiness: profileId,
//   }));

//   await Variant.insertMany(updatedVariants);

//   return result;
// };

// save as drafh -----------------

// const saveProductAsDraftIntoDB = async (
//   profileId: string,
//   payload: IProduct,
//   files: any,
// ) => {
//   const category = await Category.findById(payload.category);
//   if (!category) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
//   }

//   let productImages: string[] = [];
//   if (Array.isArray(files)) {
//     productImages = files
//       .filter((file: any) => file.fieldname === 'product_image')
//       .map((file: any) => file.path);
//   }
//   // variant images
//   const variantImagesMap: { [key: string]: string[] } = {};
//   if (Array.isArray(files)) {
//     files.forEach((file: any) => {
//       if (file.fieldname.startsWith('variant_image_')) {
//         const sku = file.fieldname.replace('variant_image_', '');
//         if (!variantImagesMap[sku]) {
//           variantImagesMap[sku] = [];
//         }
//         variantImagesMap[sku].push(file.path);
//       }
//     });
//   }
//   const result = await Product.create({
//     ...payload,
//     bussiness: profileId,
//     images: productImages,
//     status: ENUM_PRODUCT_STATUS.DRAFT,
//   });

//   const updatedVariants = payload.variants.map((variant) => ({
//     ...variant,
//     images: variantImagesMap[variant.sku] || [],
//     product: result._id,
//     bussiness: profileId,
//   }));

//   await Variant.insertMany(updatedVariants);

//   return result;
// };

const createProduct = async (bussinessId: string, payload: IProduct) => {
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const result = await Product.create({ ...payload, bussiness: bussinessId });
  return result;
};

const publishProductFromDraft = async (
  profileId: string,
  id: string,
  payload: IProduct,
) => {
  const product = await Product.findOne({
    bussiness: profileId,
    _id: id,
    status: ENUM_PRODUCT_STATUS.DRAFT,
  });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  payload.status = ENUM_PRODUCT_STATUS.ACTIVE;
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  //TODO: if you want to uplaod images in cloud then need to change here
  if (product.images && product.images?.length > 0) {
    for (const imageUrl of product.images) {
      deleteFileFromS3(imageUrl);
    }
  }
  return result;
};

const deleteSingleProduct = async (profileId: string, id: string) => {
  const product = await Product.findOneAndUpdate(
    { bussiness: profileId, _id: id },
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};
const softDeleteSingleProduct = async (profileId: string, id: string) => {
  const product = await Product.findOneAndUpdate(
    { bussiness: profileId, _id: id },
    { status: ENUM_PRODUCT_STATUS.ARCHIVED },
    { new: true, runValidators: true },
  );
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};
// change product status -------------

const changeProductStatus = async (profileId: string, id: string) => {
  const product = await Product.findOne({ bussiness: profileId, _id: id });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  const result = await Product.findByIdAndUpdate(
    id,
    { status: !product.status },
    { new: true, runValidators: true },
  );
  return result;
};

const getAllProduct = async (
  query: Record<string, unknown>,
  reviewerId: string,
) => {
  const productQuery = new QueryBuilder(Product.find(), query)
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  const productIds = result.map((product: any) => product._id);

  const bookmarks = await Bookmark.find({
    reviewer: reviewerId,
    product: { $in: productIds },
  }).select('product');

  const bookmarkedProductIds = new Set(
    bookmarks.map((bookmark) => bookmark.product.toString()),
  );

  const productsWithBookmarkStatus = result.map((product: any) => ({
    ...product.toObject(),
    isBookmark: bookmarkedProductIds.has(product._id.toString()),
  }));

  return {
    meta,
    result: productsWithBookmarkStatus,
  };
};

const getSingleProductFromDB = async (id: string) => {
  const result = await Product.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return result;
};

// update product

const updateProductIntoDB = async (
  bussinessId: string,
  productId: string,
  payload: Partial<IProduct>,
) => {
  if (payload.category) {
    const category = await Category.exists({ _id: payload.category });
    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
  }
  const product: any = await Product.findOne({
    bussiness: bussinessId,
    _id: productId,
  });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (payload.newImages) {
    payload.images = [...payload.newImages, ...product.images];
  } else {
    payload.images = [...product.images];
  }
  if (payload?.deletedImages) {
    payload.images = payload.images.filter(
      (url) => !payload?.deletedImages?.includes(url),
    );
  }

  const result = await Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.deletedImages?.length) {
    await Promise.all(payload.deletedImages.map(deleteFileFromS3));
  }

  return result;
};

const ProductService = {
  createProduct,
  // createProductIntoDB,
  // saveProductAsDraftIntoDB,
  publishProductFromDraft,
  deleteSingleProduct,
  softDeleteSingleProduct,
  changeProductStatus,
  getAllProduct,
  getSingleProductFromDB,
  updateProductIntoDB,
};

export default ProductService;
