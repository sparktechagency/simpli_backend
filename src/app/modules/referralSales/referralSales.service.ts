/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';
import ReferralSales from './referralSales.model';

const getReferralSales = async (userData: JwtPayload) => {
  const result = await ReferralSales.find().populate({
    path: 'product',
    select: 'name images',
  });
  return result;
};

const ReferralSalesService = {
  getReferralSales,
};

export default ReferralSalesService;
