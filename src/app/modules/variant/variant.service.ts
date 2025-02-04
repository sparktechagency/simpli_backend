import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IVariant } from './variant.interface';
import Variant from './variant.model';
import unlinkFile from '../../helper/unLinkFile';

const createVariantIntoDB = async (profileId: string, payload: IVariant) => {
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

  //TODO: if you want to uplaod images in cloud then need to change here
  if (variant.images && variant.images?.length > 0) {
    for (const imageUrl of variant.images) {
      if (!payload.images?.includes(imageUrl)) {
        unlinkFile(imageUrl);
      }
    }
  }
  const result = await Variant.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
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
