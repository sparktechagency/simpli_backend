/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Variant from '../variant/variant.model';
import { IProduct } from './product.interface';
import Product from './product.model';
import unlinkFile from '../../helper/unLinkFile';
import Category from '../category/category.model';

const createProductIntoDB = async (
  profileId: string,
  payload: IProduct,
  files: any,
) => {
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  let productImages: string[] = [];
  if (Array.isArray(files)) {
    productImages = files
      .filter((file: any) => file.fieldname === 'product_image')
      .map((file: any) => file.path);
  }
  // variant images
  const variantImagesMap: { [key: string]: string[] } = {};
  if (Array.isArray(files)) {
    files.forEach((file: any) => {
      if (file.fieldname.startsWith('variant_image_')) {
        const sku = file.fieldname.replace('variant_image_', '');
        if (!variantImagesMap[sku]) {
          variantImagesMap[sku] = [];
        }
        variantImagesMap[sku].push(file.path);
      }
    });
  }
  const result = await Product.create({
    ...payload,
    bussiness: profileId,
    images: productImages,
  });

  const updatedVariants = payload.variants.map((variant) => ({
    ...variant,
    images: variantImagesMap[variant.sku] || [],
    product: result._id,
    bussiness: profileId,
  }));

  await Variant.insertMany(updatedVariants);

  return result;
};

// save as drafh -----------------
// const saveProductAsDraftIntoDB = async (
//   profileId: string,
//   payload: IProduct,
//   files: any,
// ) => {
//   const productImages = files?.product_image
//     ? files.product_image.map((file: any) => file.path)
//     : [];

//   const variantImagesMap: { [key: string]: string[] } = {};
//   if (files) {
//     Object.keys(files).forEach((key) => {
//       if (key.startsWith('variant_image_')) {
//         const sku = key.replace('variant_image_', '');
//         variantImagesMap[sku] = files[key].map((file: any) => file.path);
//       }
//     });
//   }
//   const updatedVariants = payload.variants.map((variant) => ({
//     ...variant,
//     images: variantImagesMap[variant.sku] || [],
//   }));

//   await Variant.insertMany(updatedVariants);

//   const result = await Product.create({
//     ...payload,
//     bussiness: profileId,
//     images: productImages,
//     isDraft: true,
//     // variants: updatedVariants,
//   });

//   return result;
// };

const saveProductAsDraftIntoDB = async (
  profileId: string,
  payload: IProduct,
  files: any,
) => {
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  let productImages: string[] = [];
  if (Array.isArray(files)) {
    productImages = files
      .filter((file: any) => file.fieldname === 'product_image')
      .map((file: any) => file.path);
  }
  // variant images
  const variantImagesMap: { [key: string]: string[] } = {};
  if (Array.isArray(files)) {
    files.forEach((file: any) => {
      if (file.fieldname.startsWith('variant_image_')) {
        const sku = file.fieldname.replace('variant_image_', '');
        if (!variantImagesMap[sku]) {
          variantImagesMap[sku] = [];
        }
        variantImagesMap[sku].push(file.path);
      }
    });
  }
  const result = await Product.create({
    ...payload,
    bussiness: profileId,
    images: productImages,
  });

  const updatedVariants = payload.variants.map((variant) => ({
    ...variant,
    images: variantImagesMap[variant.sku] || [],
    product: result._id,
    bussiness: profileId,
  }));

  await Variant.insertMany(updatedVariants);

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
    isDraft: true,
  });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  const variant = await Variant.findOne({ product: product._id });
  if (!variant) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You need to add minimum one variant for that product',
    );
  }

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  //TODO: if you want to uplaod images in cloud then need to change here
  if (product.images && product.images?.length > 0) {
    for (const imageUrl of product.images) {
      if (!payload.images?.includes(imageUrl)) {
        unlinkFile(imageUrl);
      }
    }
  }
  return result;
};

const deleteSingleProduct = async (profileId: string, id: string) => {
  const product = await Product.findOne({ bussiness: profileId, _id: id });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const result = await Product.findByIdAndDelete(id);
  return result;
};
const softDeleteSingleProduct = async (profileId: string, id: string) => {
  const product = await Product.findOne({ bussiness: profileId, _id: id });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const result = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true, runValidators: true },
  );
  return result;
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

const ProductService = {
  createProductIntoDB,
  saveProductAsDraftIntoDB,
  publishProductFromDraft,
  deleteSingleProduct,
  softDeleteSingleProduct,
  changeProductStatus,
};

export default ProductService;
