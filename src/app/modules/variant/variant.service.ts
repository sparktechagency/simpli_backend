/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Product from '../product/product.model';
import { IVariant } from './variant.interface';
import Variant from './variant.model';

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

  const result = await Variant.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  console.log('result', result);

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
