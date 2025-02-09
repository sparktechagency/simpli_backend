import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Product from '../product/product.model';
import { ICampaign } from './campaign.interface';
import Campaign from './campaign.model';

const createCampaign = async (bussinessId: string, payload: ICampaign) => {
  const product = await Product.findById(payload.product);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product is required');
  }

  const result = await Campaign.create(payload);
  return result;
};

const CampaignService = {
  createCampaign,
};

export default CampaignService;
