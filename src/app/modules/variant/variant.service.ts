/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IVariant } from './variant.interface';
import Variant from './variant.model';
import Product from '../product/product.model';
import { deleteFileFromS3 } from '../../aws/deleteFromS2';

const createVariantIntoDB = async (profileId: string, payload: IVariant) => {
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Product not found that you provided ',
    );
  }
  const result = await Variant.create({ ...payload, bussiness: profileId });
  return result;
};

const updateVariantIntoDB = async (
  profileId: string,
  id: string,
  payload: Partial<IVariant>,
) => {
  const variant = await Variant.findOne({ bussiness: profileId, _id: id });
  if (!variant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Variant not found');
  }

  const varient: any = await Variant.findOne({
    _id: id,
  });
  if (!varient) {
    throw new AppError(httpStatus.NOT_FOUND, 'Varient not found');
  }

  if (payload.newImages) {
    payload.images = [...payload.newImages, ...varient.images];
  } else {
    payload.images = [...varient.images];
  }
  if (payload?.deletedImages) {
    payload.images = payload.images.filter(
      (url) => !payload?.deletedImages?.includes(url),
    );
  }

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.deletedImages?.length) {
    await Promise.all(payload.deletedImages.map(deleteFileFromS3));
  }

  return result;
};

const deleteVarintFromDB = async (profileId: string, id: string) => {
  const variant = await Variant.findOne({ bussiness: profileId, _id: id });
  if (!variant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Variant not found');
  }
  const result = await Variant.findByIdAndDelete(id);
  return result;
};

const getProductVariant = async (productId: string) => {
  const result = await Variant.find({ product: productId });
  return result;
};

const VariantService = {
  createVariantIntoDB,
  updateVariantIntoDB,
  deleteVarintFromDB,
  getProductVariant,
};

export default VariantService;
